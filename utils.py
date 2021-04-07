import os
import subprocess


def execute(command, workdir):
    bash_cmd = command.split(" ")
    print(f"waiting subprocess: {command[:20]}...", )
    process = subprocess.Popen(bash_cmd, cwd=workdir, stdout=subprocess.PIPE)
    process.wait()
    print(f"subprocess finished: {command[:20]}...", )


def local_mkdir(path: str) -> None:
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)
        print(f"folder {path} created locally")
