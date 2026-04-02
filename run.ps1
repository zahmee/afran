# تشغيل الأنجلر
# wt -w 0 new-tab -d "d:\fastapi\afran\frontend" --title "Angular" pwsh.exe -NoExit -Command "ng s -o"

# تشغيل الفاست API
# wt -w 0 new-tab -d "d:\fastapi\afran\backend" --title "FastAPI" pwsh.exe -NoExit -Command "uv run main.py"



wt -w 0 new-tab -d "d:\fastapi\afran\frontend" --title "Workspace" pwsh.exe -NoExit -Command "ng s -o" `; split-pane -v -d "d:\fastapi\afran\backend" pwsh.exe -NoExit -Command "uv run main.py"