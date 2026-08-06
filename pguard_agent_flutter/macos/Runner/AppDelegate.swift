import Cocoa
import FlutterMacOS

@main
class AppDelegate: FlutterAppDelegate {
  override func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    return true
  }

  override func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
    return true
  }

  override func applicationDidFinishLaunching(_ notification: Notification) {
    // Register the PGuardAgent plugin
    let controller = mainFlutterWindow?.contentViewController as? FlutterViewController
    if let controller = controller {
      PGuardAgentPlugin.register(with: controller.registrar(forPlugin: "PGuardAgentPlugin"))
    }
    super.applicationDidFinishLaunching(notification)
  }
}