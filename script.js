// Default Tencent Video redirect URL (Subject to change as they patch things)
// Try to use a known redirect endpoint.
// Often used: https://v.qq.com/search_redirect.html?url=
// Or mobile redirect: https://m.v.qq.com/redirect?url=

const DEFAULT_REDIRECT_BASE = "https://v.qq.com/search_redirect.html?url=";
const STORAGE_KEY = "tesla_tencent_redirect_base";
const ACCESS_PIN = "8888"; // 这里设置您的密码
const SESSION_KEY = "tesla_app_unlocked";

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkLockStatus();

    const savedBase = localStorage.getItem(STORAGE_KEY);
    if (savedBase) {
        document.getElementById('redirect-base').value = savedBase;
    }
});

// Security Lock Logic
function checkLockStatus() {
    // Check if already unlocked in this session
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
        document.getElementById('lock-screen').style.display = 'none';
    }
}

function checkPin(event) {
    if (event.key === "Enter") {
        unlockApp();
    }
}

function unlockApp() {
    const input = document.getElementById('pin-input');
    const errorMsg = document.getElementById('pin-error');
    
    if (input.value === ACCESS_PIN) {
        // Success
        sessionStorage.setItem(SESSION_KEY, "true");
        const lockScreen = document.getElementById('lock-screen');
        lockScreen.style.opacity = '0';
        setTimeout(() => {
            lockScreen.style.display = 'none';
        }, 500);
    } else {
        // Fail
        errorMsg.classList.remove('hidden');
        input.value = "";
        input.focus();
    }
}

function getRedirectBase() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_REDIRECT_BASE;
}

function launchApp(targetUrl) {
    if (!targetUrl) return;
    
    // Check if URL is complete
    if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
    }

    const base = getRedirectBase();
    // Encode the target URL component
    const fullRedirectUrl = base + encodeURIComponent(targetUrl);

    console.log("Launching:", fullRedirectUrl);
    
    // 1. 尝试强力全屏 (Force Fullscreen)
    // 这一步尝试欺骗浏览器，让它认为用户正在进行沉浸式交互
    enterFullscreen();

    // 2. 尝试画中画 (某些版本下画中画不锁 D 档)
    // 注意：画中画通常需要一个 <video> 元素，这里我们尝试在一个隐藏的 video 上触发
    // 或者依赖目标网站自身的 PiP 功能。
    
    // 3. 最终跳转
    // 稍微延迟跳转，给全屏动画一点时间
    setTimeout(() => {
        window.location.href = fullRedirectUrl;
    }, 500);
}

function enterFullscreen() {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
    }
}

function launchCustom() {
    const input = document.getElementById('custom-url');
    const url = input.value.trim();
    if (url) {
        launchApp(url);
    } else {
        alert("请输入有效的网址");
    }
}

// Settings Modal Logic
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('hidden');
}

function toggleDrivingGuide() {
    const modal = document.getElementById('driving-guide-modal');
    modal.classList.toggle('hidden');
}

function saveSettings() {
    const input = document.getElementById('redirect-base');
    const newVal = input.value.trim();
    if (newVal) {
        localStorage.setItem(STORAGE_KEY, newVal);
        toggleSettings();
    } else {
        alert("Redirect Base URL cannot be empty");
    }
}

// Experimental: Force Unlock Logic
// 创建一个隐藏的视频元素并播放，试图获取“媒体播放”的系统权限
// 这在某些车机上可以防止浏览器在 D 档被完全冻结
function tryForceUnlock() {
    const unlockVideo = document.createElement('video');
    unlockVideo.src = 'https://www.w3schools.com/html/mov_bbb.mp4'; // 使用一个小视频样本
    unlockVideo.style.position = 'fixed';
    unlockVideo.style.top = '-9999px';
    unlockVideo.muted = true; // 必须静音才能自动播放
    unlockVideo.loop = true;
    unlockVideo.playsInline = true; // iOS/WebKit 关键属性
    document.body.appendChild(unlockVideo);

    unlockVideo.play().then(() => {
        enterFullscreen();
        alert("已激活媒体通道！现在尝试点击上面的图标，成功率可能会提高。");
    }).catch(e => {
        console.error("Unlock failed:", e);
        alert("解锁尝试被拦截，请按照顶部的‘指南’操作。");
    });
}
