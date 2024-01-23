document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.highlight').forEach(highlightDiv => {
        createCopyButton(highlightDiv);
        createNameCodeBlock(highlightDiv);
    });
});

const langIconMap = {
    "react": {
        "icon": "/lang-icon/react.svg",
    },
    "yaml": {
        "icon": "/lang-icon/yaml.png",
    },
    "bash": {
        "icon": "/lang-icon/bash.png",
    },
    "shell": {
        "icon": "/lang-icon/bash.png",
    },
    "java": {
        "icon": "/lang-icon/java.svg",
    }
};

function createNameCodeBlock(highlightDiv) {
    const codeBlock = highlightDiv.querySelector('code[data-lang]');
    const language = codeBlock.getAttribute('data-lang'); // Convert language to uppercase
    const langConfig = langIconMap[language] || {};

    const fileTab = document.createElement('div');
    fileTab.className = 'file-tab';

    // Check if there's an icon and add it if it exists
    if (langConfig.icon) {
        const icon = document.createElement('img');
        icon.src = langConfig.icon;
        icon.alt = language;
        icon.className = 'file-icon';
        const label = document.createElement('span');
        label.textContent = language;
        label.className = 'file-label';
        fileTab.appendChild(icon);
        fileTab.appendChild(label);
    } else {
        const label = document.createElement('span');
        label.textContent = language;
        fileTab.appendChild(label);
    }


    highlightDiv.insertBefore(fileTab, highlightDiv.firstChild);
}


function createCopyButton(highlightDiv) {
    const button = document.createElement("button");
    button.className = "copy-code-button";
    button.type = "button";
    button.innerText = "Copy";
    button.addEventListener("click", () => copyCodeToClipboard(button, highlightDiv));
    highlightDiv.insertBefore(button, highlightDiv.firstChild);
}

async function copyCodeToClipboard(button, highlightDiv) {
    const codeBlock = highlightDiv.querySelector("code");
    const codeToCopy = codeBlock ? codeBlock.textContent : '';

    try {
        const result = await navigator.permissions.query({ name: "clipboard-write" });
        if (result.state == "granted" || result.state == "prompt") {
            await navigator.clipboard.writeText(codeToCopy);
            codeWasCopied(button);
        } else {
            copyCodeBlockExecCommand(codeToCopy);
        }
    } catch (_) {
        copyCodeBlockExecCommand(codeToCopy);
    }
}

function copyCodeBlockExecCommand(codeToCopy) {
    const textArea = document.createElement("textarea");
    textArea.value = codeToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
}

function codeWasCopied(button) {
    button.innerText = "Copied!";
    setTimeout(() => {
        button.innerText = "Copy";
    }, 2000);
}
