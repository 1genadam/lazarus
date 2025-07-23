// Simple Chat Test - Bypass all initialization
console.log('🔧 Simple Chat Test Loaded');

function testChatElements() {
    console.log('Testing chat elements...');
    
    const chatButton = document.getElementById('chat-widget-button');
    const chatWidget = document.getElementById('chat-widget');
    
    console.log('Elements found:', {
        chatButton: !!chatButton,
        chatWidget: !!chatWidget,
        buttonVisible: chatButton ? getComputedStyle(chatButton).display !== 'none' : false,
        widgetHidden: chatWidget ? chatWidget.classList.contains('hidden') : false
    });
    
    if (chatButton && chatWidget) {
        console.log('✅ Adding simple test click handler...');
        
        // Remove any existing click handlers
        chatButton.onclick = null;
        
        // Add simple click handler
        chatButton.addEventListener('click', function(e) {
            console.log('🖱️ SIMPLE TEST CLICK!', e);
            e.preventDefault();
            e.stopPropagation();
            
            if (chatWidget.classList.contains('hidden')) {
                chatWidget.classList.remove('hidden');
                console.log('Chat opened');
            } else {
                chatWidget.classList.add('hidden');
                console.log('Chat closed');
            }
        });
        
        console.log('✅ Simple click handler added');
        
        // Test auto-open after 3 seconds
        setTimeout(() => {
            console.log('🔄 Testing auto-open...');
            if (chatWidget.classList.contains('hidden')) {
                chatWidget.classList.remove('hidden');
                console.log('✅ Auto-open test successful');
            }
        }, 3000);
        
    } else {
        console.error('❌ Chat elements not found!');
    }
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testChatElements);
} else {
    testChatElements();
}

// Also run after a delay
setTimeout(testChatElements, 1000);