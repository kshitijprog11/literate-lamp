document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mailchimp-form');
    const message = document.getElementById('subscription-message');

    // Check if CONFIG exists and has Mailchimp settings
    const mailchimpConfig = window.CONFIG && window.CONFIG.mailchimp;

    if (form) {
        if (mailchimpConfig && mailchimpConfig.actionUrl) {
            form.action = mailchimpConfig.actionUrl;

            // Check for hidden input name customization (Mailchimp often uses b_..._... for bot protection)
            // If the user needs to customize this, they might need to update the HTML or we could try to parse it from the action URL
            // For now, we assume the HTML structure is generic enough or the user will update the HTML if needed.
        } else {
            console.warn('Mailchimp action URL not configured in config.js');
        }

        form.addEventListener('submit', function(e) {
            if (!mailchimpConfig || !mailchimpConfig.actionUrl) {
                e.preventDefault();
                message.textContent = 'Subscription is not currently configured. Please check back later.';
                message.className = 'message error-message';
                message.classList.remove('hidden');
                return;
            }

            // If action URL is set, Mailchimp usually handles the rest via the form submission to a new window.
            // We can show a message saying "Please check the new tab to confirm..."
            message.textContent = 'Thanks! Please check the opened tab to confirm your subscription.';
            message.className = 'message success-message';
            message.classList.remove('hidden');

            // Optional: clear input after a delay
            setTimeout(() => {
                const emailInput = form.querySelector('input[type="email"]');
                if (emailInput) emailInput.value = '';
            }, 1000);
        });
    }
});
