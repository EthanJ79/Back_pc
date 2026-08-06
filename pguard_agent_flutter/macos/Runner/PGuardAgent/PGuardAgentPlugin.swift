// macOS/Runner/PGuardAgent/PGuardAgentPlugin.swift
// Native macOS implementation for active window and idle detection

import Foundation
import AppKit
import Quartz

class PGuardAgentPlugin: NSObject, FlutterPlugin {
    static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(name: "com.pguard.agent/macos", binaryMessenger: registrar.messenger())
        let instance = PGuardAgentPlugin()
        registrar.addMethodCallDelegate(instance, channel: channel)
    }

    func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "getActiveWindow":
            getActiveWindow(result: result)
        case "getIdleTime":
            getIdleTime(result: result)
        case "registerAutoStart":
            registerAutoStart(call: call, result: result)
        case "unregisterAutoStart":
            unregisterAutoStart(result: result)
        case "isAutoStartEnabled":
            isAutoStartEnabled(result: result)
        default:
            result(FlutterMethodNotImplemented)
        }
    }

    private func getActiveWindow(result: @escaping FlutterResult) {
        DispatchQueue.main.async {
            let workspace = NSWorkspace.shared
            guard let activeApp = workspace.frontmostApplication else {
                result(["processName": NSNull(), "windowTitle": NSNull()])
                return
            }

            let processName = activeApp.localizedName?.lowercased() ?? ""
            let pid = activeApp.processIdentifier

            // Quartz를 사용해 전면 창 타이틀 가져오기
            var windowTitle = "알 수 없는 창"
            let options: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
            let windowList = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] ?? []

            for window in windowList {
                let windowPID = window[kCGWindowOwnerPID as String] as? Int ?? -1
                if windowPID == pid {
                    let windowLayer = window[kCGWindowLayer as String] as? Int ?? -1
                    if windowLayer == 0 { // 일반 창
                        windowTitle = window[kCGWindowName as String] as? String ?? ""
                        break
                    }
                }
            }

            // 창 타이틀을 찾지 못했다면 번들 식별자 사용
            if windowTitle.isEmpty || windowTitle == "알 수 없는 창" {
                windowTitle = activeApp.bundleIdentifier ?? processName
            }

            result([
                "processName": processName,
                "windowTitle": windowTitle
            ])
        }
    }

    private func getIdleTime(result: @escaping FlutterResult) {
        let idleTime = CGEventSourceSecondsSinceLastEventType(
            CGEventSourceStateID.hidSystemState,
            CGEventType.anyInput
        )
        result(idleTime)
    }

    private func registerAutoStart(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let scriptPath = args["scriptPath"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "scriptPath required", details: nil))
            return
        }

        let plistPath = (NSHomeDirectory() as NSString).appendingPathComponent("Library/LaunchAgents/com.pguard.agent.plist")
        let plistDir = (plistPath as NSString).deletingLastPathComponent

        do {
            try FileManager.default.createDirectory(atPath: plistDir, withIntermediateDirectories: true)

            // 기존 서비스 언로드
            let unloadTask = Process()
            unloadTask.launchPath = "/bin/launchctl"
            unloadTask.arguments = ["unload", plistPath]
            unloadTask.launch()
            unloadTask.waitUntilExit()

            let plistContent = """
            <?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
            <plist version="1.0">
            <dict>
                <key>Label</key>
                <string>com.pguard.agent</string>
                <key>ProgramArguments</key>
                <array>
                    <string>$(which python3)</string>
                    <string>\(scriptPath)</string>
                    <string>--background</string>
                </array>
                <key>RunAtLoad</key>
                <true/>
                <key>KeepAlive</key>
                <true/>
                <key>WorkingDirectory</key>
                <string>\((scriptPath as NSString).deletingLastPathComponent)</string>
                <key>StandardOutPath</key>
                <string>\((scriptPath as NSString).deletingLastPathComponent)/agent_stdout.log</string>
                <key>StandardErrorPath</key>
                <string>\((scriptPath as NSString).deletingLastPathComponent)/agent_stderr.log</string>
            </dict>
            </plist>
            """

            try plistContent.write(toFile: plistPath, atomically: true, encoding: .utf8)

            let loadTask = Process()
            loadTask.launchPath = "/bin/launchctl"
            loadTask.arguments = ["load", plistPath]
            loadTask.launch()
            loadTask.waitUntilExit()

            result(loadTask.terminationStatus == 0)
        } catch {
            result(FlutterError(code: "REGISTER_FAILED", message: error.localizedDescription, details: nil))
        }
    }

    private func unregisterAutoStart(result: @escaping FlutterResult) {
        let plistPath = (NSHomeDirectory() as NSString).appendingPathComponent("Library/LaunchAgents/com.pguard.agent.plist")
        
        let unloadTask = Process()
        unloadTask.launchPath = "/bin/launchctl"
        unloadTask.arguments = ["unload", plistPath]
        unloadTask.launch()
        unloadTask.waitUntilExit()

        do {
            try FileManager.default.removeItem(atPath: plistPath)
            result(true)
        } catch {
            result(false)
        }
    }

    private func isAutoStartEnabled(result: @escaping FlutterResult) {
        let plistPath = (NSHomeDirectory() as NSString).appendingPathComponent("Library/LaunchAgents/com.pguard.agent.plist")
        result(FileManager.default.fileExists(atPath: plistPath))
    }
}