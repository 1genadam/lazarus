// Chat Debug Script - Immediate Diagnostics
console.log('🔍 Chat Debug Script Loaded');

// Check if elements exist
function checkChatElements() {
    console.log('🔍 Checking chat elements...');
    
    const chatButton = document.getElementById('chat-widget-button');
    const chatWidget = document.getElementById('chat-widget');
    const closeButton = document.getElementById('close-chat-widget');
    
    console.log('Chat Elements Check:', {
        chatButton: !!chatButton,
        chatWidget: !!chatWidget,
        closeButton: !!closeButton,
        buttonVisible: chatButton ? !chatButton.offsetParent === null : false,
        widgetHidden: chatWidget ? chatWidget.classList.contains('hidden') : false
    });
    
    if (chatButton) {
        console.log('Button element:', chatButton);
        console.log('Button computed style:', window.getComputedStyle(chatButton));
    }
    
    return { chatButton, chatWidget, closeButton };
}

// Add simple click handler for testing
function addTestClickHandler() {
    const { chatButton, chatWidget } = checkChatElements();
    
    if (chatButton && chatWidget) {
        console.log('🖱️ Adding test click handler...');
        
        // Remove any existing listeners first
        const newButton = chatButton.cloneNode(true);
        chatButton.parentNode.replaceChild(newButton, chatButton);
        
        newButton.addEventListener('click', function(e) {
            console.log('🖱️ TEST CLICK DETECTED!', e);
            console.log('Widget classes before:', chatWidget.classList.toString());
            
            chatWidget.classList.toggle('hidden');
            
            console.log('Widget classes after:', chatWidget.classList.toString());
            console.log('Widget visible:', !chatWidget.classList.contains('hidden'));
        });
        
        console.log('✅ Test click handler added');
    } else {
        console.error('❌ Cannot add click handler - elements missing');
    }
}

// Check if chat system is loaded
function checkChatSystem() {
    console.log('🔍 Checking chat system...');
    console.log('LazarusChatWidget class:', typeof LazarusChatWidget);
    console.log('window.lazarusChat:', typeof window.lazarusChat);
    
    if (window.lazarusChat) {
        console.log('Chat system loaded:', window.lazarusChat);
    } else {
        console.warn('⚠️ Chat system not loaded');
    }
}

// Run diagnostics
function runDiagnostics() {
    console.log('🚀 Running chat diagnostics...');
    checkChatElements();
    checkChatSystem();
    addTestClickHandler();
}

// Run immediately and on DOM ready
runDiagnostics();

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DOM loaded - running diagnostics again...');
    setTimeout(runDiagnostics, 100);
});

window.addEventListener('load', () => {
    console.log('🔍 Window loaded - final diagnostics...');
    setTimeout(runDiagnostics, 100);
});