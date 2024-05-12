export class CustomPopup {
    constructor() {
        this.popup = document.getElementById('popup');
        this.popupText = document.getElementById('popup-text');
    }

    open(text, options = { autoClose: false, duration: 5000 }) {
        this.popupText.textContent = text;
        this.popup.style.opacity = 0; // Start with 0 opacity
        this.popup.style.display = 'block';

        // Fade in effect
        setTimeout(() => {
            this.popup.style.transition = 'opacity 0.2s';
            this.popup.style.opacity = 1;
        }, 100);

        // Check if auto-close option is enabled
        if (options.autoClose) {
            setTimeout(() => {
                this.close();
            }, options.duration);
        }
    }

    close() {
        this.popup.style.opacity = 0; // Fade out effect
        setTimeout(() => {
            this.popup.style.display = 'none';
        }, 500); // Wait for fade out transition to complete before hiding
    }
}

export default CustomPopup