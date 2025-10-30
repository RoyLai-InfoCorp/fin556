# Setup Guide (15 minutes to complete)

## Overview

Please follow the steps below to set up your development environment for the course. This guide covers installation and configuration of all necessary tools and software.

-   [ ] Step 1. Setup terminal.
-   [ ] Step 2. Install Git.
-   [ ] Step 3. Clone FIN556 repository.
-   [ ] Step 4. Install Docker Desktop.
-   [ ] Step 5. Install Visual Studio Code.
-   [ ] Step 6. Verify DevContainer setup.

---

## Step 1. Setup Terminal

📌 **NOTE: Moving forward, whenever the guide refers to **"Terminal"**, it is referring either to the Windows Terminal for Windows/WSL2 users, or the native Terminal application for macOS users.**

The purpose of this step is to standardize the terminal environment for all students in the class to use Linux-based commands. This is important because most blockchain development tools are designed to work in a Unix-like environment.

-   **🪟 Windows Users**

    1. Install WSL2 (Windows Subsystem for Linux). Follow the official Microsoft guide **[here](https://learn.microsoft.com/en-us/windows/wsl/install)**.

        - During installation, choose Ubuntu **24.04 LTS**.
        - You will be prompted to create a username and password for your Linux environment. ⚠️ Remember these credentials as you'll need them later.

    📌 NOTE: If you failed to install using the link above, try using the manual approach instead **[here](https://learn.microsoft.com/en-us/windows/wsl/install-manual)**

    2. Install **[Windows Terminal](https://aka.ms/terminal)** from the Microsoft Store.

    3. Open Windows Terminal, select **Ubuntu** from the dropdown, and confirm you can see a terminal prompt.

    4. Task completed ✅.

-   **🍎 macOS Users**

    1. There is no need to install anything extra, as macOS comes with a built-in terminal application.

    2. Find Terminal using one of these methods:

        - Press **Cmd + Space** and type **Terminal**
        - Go to Applications > Utilities > Terminal
        - Use Launchpad and search for **Terminal**

    3. Open Terminal and confirm you see a command prompt with your username.

    4. Task completed ✅.

---

## Step 2. Check Your Architecture

The subsequent steps may require you to know your computer's CPU architecture (e.g., x86_64 or ARM64). This is important for downloading the correct versions of software.

-   **🪟 Windows Users**

    1. Open **Windows Terminal** (with WSL2 enabled).
    2. Run the following command:

        ```bash
        uname -m
        ```

    3. Note down the output:

        - If it shows `x86_64`, your architecture is x86_64.
        - If it shows `aarch64`, your architecture is ARM64.

    4. Task completed ✅.

-   **🍎 macOS Users**

    1. Open **Terminal**.
    2. Run the following command:

        ```bash
        uname -m
        ```

    3. Note down the output:

        - If it shows `x86_64`, your architecture is x86_64 (Intel).
        - If it shows `arm64`, your architecture is ARM64 (Apple Silicon).

    4. Task completed ✅.

---

## Step 3. Install Git

Git is a version control system that allows you to track changes in your code and collaborate with others. It is required for downloading course materials and managing your project files.

-   **🪟 Windows Users**

    1. Download Git for Windows from **[this link](https://git-scm.com/download/win)**.

    2. Run the installer and follow the installation wizard with default settings.

    3. Git for Windows includes Git for WSL2 integration.

    4. Open Windows Terminal with WSL2 and verify installation:

        ```bash
        git --version
        ```

    5. Task completed ✅.

-   **🍎 macOS Users**

    1. Git is often pre-installed on macOS. Check if it's already installed:

        ```bash
        git --version
        ```

    2. **Only if not installed**, you can install it via:

        - **Option 1**: Download from **[this link](https://git-scm.com/download/mac)**
        - **Option 2**: Install Xcode Command Line Tools:
            ```bash
            xcode-select --install
            ```

    3. Verify installation:

        ```bash
        git --version
        ```

    4. Task completed ✅.

---

## Step 4. Install Docker Desktop

Docker Desktop is required for DevContainer functionality used in this course.
For non-technical users, Docker allows you to run applications in isolated environments called containers. This is essential for ensuring that all students have the same development environment regardless of their host operating system.

### a) Download Docker Desktop

-   Download Docker Desktop from the official download page:

    **👉 [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)**

### b) Installation by Operating System

-   **🪟 Windows Users**

    1. Download the correct version for your system, based on your architecture identified in [Step 2](#step-2-check-your-architecture):
        - For **x86_64**, download the x86_64 version.
        - For **aarch64**, download the ARM64 version.
    2. Run the installer and follow the prompts.
    3. After installation, open **Docker Desktop → Settings → Resources → WSL Integration**, and **enable integration for your WSL2 distribution**.

-   **🍎 macOS Users**

    1. Download the correct version for your system, based on your architecture identified in [Step 2](#step-2-check-your-architecture):
        - Intel Macs (**x86_64**) → download the Intel build.
        - Apple Silicon Macs (**ARM64**) → download the Apple Silicon build.
    2. Run the installer and follow the on-screen instructions.
    3. If prompted, allow permissions under:  
       **System Settings ▸ Privacy & Security ▸ Allow Docker Desktop.**

### c) Verify Docker Desktop Installation

1. Launch **Docker Desktop**.

    - Make sure the whale 🐳 icon in the menu bar shows “Docker Desktop is running.”

2. Open **Terminal** and run:

    ```bash
    docker --version
    ```

    You should see a version number, e.g., `Docker version 24.0.5, build 0a4c701`.

3. Task completed ✅.

---

## Step 4. Install Visual Studio Code

Visual Studio Code is the code editor that we will use for development in this course.

### a) Download Visual Studio Code

1. Download Visual Studio Code from **[this link](https://code.visualstudio.com/)**.

### b) Installation by Operating System

-   **🪟 Windows Users**

    Proceed with the default installation options.

-   **🍎 macOS Users**

    Follow these steps to enable the `code` command in your terminal:

    1. Install **Visual Studio Code.app** in your **Applications** folder.
    2. Open the Terminal app.
    3. Run this command.

        ```bash
        sudo ln -s "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" /usr/local/bin/code
        ```

    4. Close and reopen Terminal, then test with:

        ```bash
        code .
        ```

---

## Step 5. Clone FIN556 Repository

**Cloning** the repository means downloading a copy of the course materials from GitHub to your local machine. These files are necessary for all your lab exercises and assignments and will be updated throughout the course on a weekly basis.

1. Open your **Terminal** (Windows Terminal with WSL2 or macOS Terminal).

2. Go to your home directory.

    ```bash
    cd ~
    ```

3. Create a courses directory (if not already created):

    NOTE: If the `courses` directory already exists, you can skip this step. Otherwise, it will raise an error.

    ```bash
    mkdir courses
    ```

4. Change into the `courses` directory:

    ```bash
    cd courses
    ```

5. Clone the FIN556 repository from GitHub:

    NOTE: Make sure FIN556 is capitalized as shown below.

    ```bash
    git clone https://github.com/RoyLai-InfoCorp/FIN556.git
    ```

6. Verify the courses directory contains the `FIN556` folder:

    ```bash
    ls -la
    ```

7. Change into the FIN556 directory:

    ```bash
    cd FIN556
    ```

8. Verify the FIN556 directory contains the `day-0` folder:

    ```bash
    ls -la
    ```

9. Task completed ✅.

## Step 6. Update FIN556 Repository

In subsequent weeks, you can go to your `FIN556` directory directly by running:

```bash
cd ~/courses/FIN556
```

Then, to update your local repository with the latest course materials, run:

```bash
git pull
```

## Step 5. Open Repository in Visual Studio Code

Continuing from the previous step, enter the following commands in your terminal:

```bash
code .
```

This will open the FIN556 repository in Visual Studio Code containing all your lab exercises and assignments.

---

## Step 6. Open Repository in DevContainer

### a) Install Dev Containers Extension

-   Click on the Extensions icon in the sidebar (or press **Ctrl + Shift + X**)
-   Search for "Dev Containers" and click "Install"
-   Task completed ✅.

### b) Configure Platform for DevContainer (macOS or ARM64 users only)

**NOTE:** Refer to earlier [step 2](#step-2-check-your-architecture) to identify your architecture.

The following instructions are only necessary if your computer architecture is **aarch64** (Apple Silicon Macs or ARM64 Windows PCs). If your architecture is **x86_64**, you can skip this section.

-   Create a file named **docker-compose.override.yml** in the **.devcontainer** directory.
-   Add the following content to the file:

    ```yaml
    services:
        devcontainer:
        platform: linux/arm64
    ```

### c) Open Course Repository in DevContainer

-   **Prerequisites Check**

    -   Ensure Docker Desktop is running
    -   Ensure Visual Studio Code is installed with Dev Containers extension
    -   Ensure you have successfully cloned the FIN556 repository

1. Click "Reopen in Container" (or press **Ctrl + Shift + P** and type **Dev Containers: Reopen in Container**)

    ![open in container](./img/dev-container.png)

2. VS Code will automatically:

    - Build the development container
    - Install all required blockchain development tools
    - Install extensions (Solidity, Hardhat, etc.)
    - Set up the complete development environment

3. Wait for the container to build (this may take a few minutes on first run)

4. Once complete, you should see:
    - The FIN556 project files in the explorer
    - A terminal with the development environment ready
    - Extensions automatically installed and active

---

## Step 7. Verify DevContainer Setup

DevContainers allow you to develop inside a Docker container with all necessary dependencies pre-installed. This ensures a consistent development environment across different machines.

1. Open the integrated terminal in VS Code (**Ctrl + `**)

2. Verify the development tools are installed:

    ```bash
    node --version

     # v22.15.0

    npm --version

     # 10.9.2

    git --version

     # git version 2.34.1
    ```

3. Test that hardhat-shorthand is available (this will be used in day-1 lessons):

    ```bash
    npm ls -g

     #/usr/local/share/nvm/versions/node/v22.15.0/lib
     #├── corepack@0.32.0
     #├── hardhat-shorthand@1.1.0
     #└── npm@10.9.2
    ```

4. Task completed ✅.

---

## Step 8. Find your Student Group in Canvas

1. Login to Canvas

2. Go to your Course site (e.g., FIN556_JUL25_L01)

3. Click on "People" in the left-hand menu

4. Click on "Groups" tab

    ![canvas_groups](./img/canvas_groups.png)

5. Identify your assigned group (there can be no more than 5 members in a group).

---

## Step 9. Send Confirmation Email

Upon successful completion of all setup steps, please send a confirmation email to the course instructor indicating that your development environment is ready for class. Please include:

-   your full name
-   student identification number
-   Windows or macOS or others.
-   Your assigned student group (from Step 7)

---

## About the DevContainer

This section is purely informational and describes the configuration and tools pre-installed in the DevContainer.

### a) Installed Tools

The following tools are pre-installed in the DevContainer:

-   **Node.js**: JavaScript runtime for building blockchain applications.
-   **npm**: Package manager for JavaScript.
-   **git**: Version control system for tracking changes in code.
-   **hardhat-shorthand**: Global npm package that allows using `hh` instead of `npx hardhat` commands.

### b) Installed Visual Studio Code Extensions

The following Visual Studio Code extensions are pre-installed in the DevContainer:

-   **Solidity (Juan Blanco)**: Language support for Solidity contracts.
-   **Prettier**: Code formatter for consistent styling.
-   **ESLint**: Linter for identifying and fixing code issues.
-   **JavaScript(ES6) code snippets**: Enhances JavaScript development with useful snippets.

---

## Troubleshooting

### Common Issues

These are some common issues you may encounter while setting up your development environment. The solutions are provided for convenience only. If the suggested actions does not work for you, please search on the web for more details.

**Docker Desktop not starting:**

-   Ensure virtualization is enabled in BIOS/UEFI
-   On Windows, ensure WSL2 is properly installed
-   Restart your computer after installation
-   Google "Docker Desktop not starting" for more help

**DevContainer fails to build:**

-   Check Docker Desktop is running
-   Ensure you have stable internet connection
-   Try rebuilding with **Ctrl + Shift + P** → **Dev Containers: Rebuild Container**
-   Google "DevContainer fails to build" for more help

**VS Code extensions not working:**

-   Reload VS Code window: **Ctrl + Shift + P** → **Developer: Reload Window**
-   Check if extensions are enabled
-   Update VS Code to latest version

**macOS-specific issues:**

-   **Docker Desktop permission denied**: Go to System Preferences > Security & Privacy > General and allow Docker
-   **Terminal command not found**: Ensure you're using the correct terminal (not zsh with restricted PATH)
-   **Apple Silicon compatibility**: Download ARM64 versions of Docker Desktop and VS Code for M1/M2/M3/M4 Macs
-   **File permissions in DevContainer**: If you encounter permission issues, try rebuilding the container
