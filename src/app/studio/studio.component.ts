import { Component, ElementRef, ViewChild } from '@angular/core';
import { MediaRecorder } from 'extendable-media-recorder';

@Component({
  selector: 'app-studio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss'],
})
export class StudioComponent {
  @ViewChild('studioCanvas', { static: true }) studioCanvas: ElementRef;
  @ViewChild('webcamStudio', { static: false })
  webcamStudio: ElementRef<HTMLVideoElement>;

  public recordedChunks: any = [];
  public recording = false;

  public bgColor: string = '#FFFFFF';

  public canvasSettings = {
    width: 720,
    height: 540,
  };

  private constraints = {
    audio: true,
    video: true,
  };

  private webcamOn = true;
  private mediaRecorder: any;

  ngAfterViewInit(): void {
    this.initWebCam();
  }

  public async chooseTemplate(templateNumber: number): Promise<void> {
    await this.clearCanvas();
    this.webcamOn = true;
    switch (templateNumber) {
      case 1:
        this.drawCam();
        break;
      case 2:
        this.drawHalf();
        break;
      case 3:
        this.drawHalf(true);
        break;
    }
  }

  public async chooseBg(color: string) {
    this.bgColor = color;
  }

  public async connect(server: string) {
  }

  public clearCanvas(): Promise<void> {
    const that = this;
    this.webcamOn = false;
    return new Promise((resolve) => {
      setTimeout(() => {
        that.clearCam();
        resolve();
      }, 15);
    });
  }

  private clearCam() {
    this.getCanvasContext().clearRect(
      0,
      0,
      this.canvasSettings.width,
      this.canvasSettings.height
    );
  }

  public recordCanvas(): void {
    this.recording = true;
    const stream = this.studioCanvas.nativeElement.captureStream(25);

    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    if (videoTracks.length > 0) {
      console.log(`Using video device: ${videoTracks[0].label}`);
    }
    if (audioTracks.length > 0) {
      console.log(`Using audio device: ${audioTracks[0].label}`);
    }

    const pc1 = new RTCPeerConnection();
    console.log(pc1);

    //const options = { mimeType: 'video/webm; codecs=vp9' };
    const options = { mimeType: 'video/webm;codecs=h264' };
    this.mediaRecorder = new MediaRecorder(stream, options);

    const that = this;

    this.mediaRecorder.ondataavailable = function (event: any) {
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
      console.log('stopping');
      this.mediaRecorder.stop();
    }, 5000);
  }

  private download(): void {
    var blob = new Blob(this.recordedChunks, {
      type: 'video/webm',
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    // a.style = "display: none";
    a.href = url;
    a.download = 'test.webm';
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
      .then(function (stream) {
        that.webcamStudio.nativeElement.srcObject = stream;
        requestAnimationFrame(() => {
          that.drawCam();
        });
      })
      .catch(function (error) {
        console.error(
          'navigator.MediaDevices.getUserMedia error: ',
          error.message,
          error.name
        );
      });
  }

  private drawCam(): void {
    const that = this;
    setTimeout(function () {
      that.drawCanvas(
        that.webcamStudio.nativeElement,
        0,
        0,
        that.canvasSettings.width,
        that.canvasSettings.height
      );
      if (that.webcamOn) {
        that.drawCam();
      }
    }, 10);
  }

  private drawHalf(inverse = false): void {
    const that = this;
    setTimeout(function () {
      that.drawCanvas(
        that.webcamStudio.nativeElement,
        inverse ? 360 : 0,
        150,
        that.canvasSettings.width / 2,
        that.canvasSettings.height / 2
      );
      if (that.webcamOn) {
        that.drawHalf(inverse);
      }
    }, 10);

    this.getCanvasContext().beginPath();
    this.getCanvasContext().arc(inverse ? 180 : 550, 270, 140, 0, 2 * Math.PI);
    this.getCanvasContext().stroke();
  }

  private drawCanvas(
    image: CanvasImageSource,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void {
    const ctx = this.getCanvasContext();

    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvasSettings.width, this.canvasSettings.height);

    ctx.drawImage(image, dx, dy, dw, dh);
  }
}
