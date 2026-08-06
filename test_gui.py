import sys
import os

# add parent dir to path so we can import agent
sys.path.append(r"d:\project\Back_PC")

try:
    import agent.agent as a
    a.show_setup_gui()
except Exception as e:
    import traceback
    traceback.print_exc()
