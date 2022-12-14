let processor = {
    timerCallback: function () {
        if (this.video.paused || this.video.ended) {
            return;
        }
        this.computeFrame();
        let self = this;
        setTimeout(function () {
            self.timerCallback();
        }, 0);
    },

    doLoad: function () {
        this.video = document.getElementById("preview");

        this.c1 = document.getElementById("c1");
        this.ctx1 = this.c1.getContext("2d");
        let self = this;
        this.video.addEventListener("play", function () {
            self.width = self.video.videoWidth;
            self.height = self.video.videoHeight;

            c1.width = self.width
            c1.height = self.height
            self.timerCallback();
        }, false);
    },

    computeFrame: function () {
        this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
        let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
        let l = frame.data.length / 4;

        for (let i = 0; i < l; i++) {
            let r = frame.data[i * 4 + 0];
            let g = frame.data[i * 4 + 1];
            let b = frame.data[i * 4 + 2];

            frame.data[i * 4 + 1] += 30
            frame.data[i * 4 + 2] += 40
            frame.data[i * 4 + 3] = 50;
        }
        this.ctx1.putImageData(frame, 0, 0);
        return;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    processor.doLoad();
});