document.addEventListener("DOMContentLoaded", (event) => {
    const ProgressBar = {
        init: function() {
            this.elements = {
                label: document.getElementById("progress-label"),
                percentage: document.getElementById("progress-percentage"),
                bar: document.getElementById("progress-bar"),
                container: document.getElementById("progress-container")
            };
            this.setupListeners();
        },

        setupListeners: function() {
            window.addEventListener("message", (event) => {
                if (event.data.action === "progress") {
                    this.update(event.data);
                } else if (event.data.action === "cancel") {
                    this.cancel();
                }
            });
        },

        update: function(data) {
            if (this.animationFrameRequest) {
                cancelAnimationFrame(this.animationFrameRequest);
            }
            clearTimeout(this.cancelledTimer);

            this.elements.container.classList.remove("cancelled");
            this.elements.label.textContent = data.label;
            this.elements.percentage.textContent = "0%";
            this.elements.container.style.display = "block";
            
            const startTime = Date.now();
            const duration = parseInt(data.duration, 10);

            const animateProgress = () => {
                const timeElapsed = Date.now() - startTime;
                let progress = Math.min(timeElapsed / duration, 1);
                const percentage = Math.round(progress * 100);
                
                this.elements.bar.style.width = percentage + "%";
                this.elements.percentage.textContent = percentage + "%";
                
                if (progress < 1) {
                    this.animationFrameRequest = requestAnimationFrame(animateProgress);
                } else {
                    this.onComplete();
                }
            };
        
            this.animationFrameRequest = requestAnimationFrame(animateProgress);
        },

        cancel: function() {
            if (this.animationFrameRequest) {
                cancelAnimationFrame(this.animationFrameRequest);
                this.animationFrameRequest = null;
            }
            
            this.elements.container.classList.add("cancelled");
            this.elements.label.textContent = "CANCELLED";
            this.elements.percentage.textContent = "";
            this.elements.bar.style.width = "100%";
            
            this.cancelledTimer = setTimeout(this.onCancel.bind(this), 1000);
        },

        onComplete: function() {
            this.elements.container.style.display = "none";
            this.elements.bar.style.width = "0";
            this.elements.percentage.textContent = "";
            this.postAction("FinishAction");
        },

        onCancel: function() {
            this.elements.container.style.display = "none";
            this.elements.bar.style.width = "0";
            this.elements.percentage.textContent = "";
        },

        postAction: function(action) {
            fetch(`https://progressbar/${action}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
        }
    };

    ProgressBar.init();
});