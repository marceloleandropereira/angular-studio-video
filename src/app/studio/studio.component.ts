import { Component, ElementRef, ViewChild } from '@angular/core';
import { MediaRecorder } from 'extendable-media-recorder';

@Component({
  selector: 'app-studio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent {

  @ViewChild('studioCanvas', { static: true }) studioCanvas: ElementRef;
  @ViewChild('webcamStudio', { static: false }) webcamStudio: ElementRef<HTMLVideoElement>;

  public recordedChunks: any = [];
  public recording = false;

  public canvasSettings = {
    width: 720,
    height: 540
  }

  private constraints = {
    audio: false,
    video: true
  };

  private webcamOn = true;
  private mediaRecorder: any;

  ngAfterViewInit(): void {
    this.initWebCam();
  }

  public chooseTemplate(templateNumber: number): void {
    this.webcamOn = true;
    if (templateNumber === 1) {
      this.drawCam();
    } else {
      this.drawHalf();
    }
  }

  public clearCanvas() {
    const that = this;
    this.webcamOn = false;
    setTimeout(function() {
      that.getCanvasContext().clearRect(0, 0, that.canvasSettings.width, that.canvasSettings.height);
    }, 15);
  }

  public recordCanvas(): void {
    this.recording = true;
    const stream = this.studioCanvas.nativeElement.captureStream(25);

    const options = { mimeType: "video/webm; codecs=vp9" };
    this.mediaRecorder = new MediaRecorder(stream, options);

    const that = this;

    this.mediaRecorder.ondataavailable = function(event: any) {
      if (event.data.size > 0) {
        that.recordedChunks.push(event.data);
        that.download();
        that.recording = false;
      } else {
        console.log('else');
        // ...
      }
    };
    this.mediaRecorder.start();

    setTimeout(() => {
      console.log("stopping");
      this.mediaRecorder.stop();
    }, 5000);
  }

  private download(): void {
    var blob = new Blob(this.recordedChunks, {
      type: "video/webm"
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    // a.style = "display: none";
    a.href = url;
    a.download = "test.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private getCanvasContext(): CanvasRenderingContext2D {
    return this.studioCanvas.nativeElement.getContext('2d');
  }

  private initWebCam(): void {
    const that = this;

    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then(function(stream){
        that.webcamStudio.nativeElement.srcObject = stream;
        requestAnimationFrame(() => {
          that.drawCam();
        });

      })
      .catch(function(error) {
        console.error('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
      });
  }

  private drawCam(): void {
    const that = this;
    setTimeout(function() {
      that.drawCanvas(that.webcamStudio.nativeElement, 0, 0, that.canvasSettings.width, that.canvasSettings.height);
      if (that.webcamOn) {
        that.drawCam();
      }
    }, 10);
  }

  private drawHalf(): void {
    const that = this;
    setTimeout(function() {
      that.drawCanvas(that.webcamStudio.nativeElement, 0, 150, (that.canvasSettings.width / 2), (that.canvasSettings.height / 2));
      if (that.webcamOn) {
        that.drawHalf();
      }
    }, 10);

    this.getCanvasContext().beginPath();
    this.getCanvasContext().arc(550, 270, 140, 0, 2 * Math.PI);
    this.getCanvasContext().stroke();

  }

  private drawCanvas(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void {
    this.getCanvasContext().drawImage(image, dx, dy, dw, dh);
  }
}
