import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-studio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent {

  @ViewChild('studioCanvas', { static: true }) studioCanvas: ElementRef;
  @ViewChild('webcamStudio', { static: false }) webcamStudio: ElementRef<HTMLVideoElement>;

  public canvasSettings = {
    width: 720,
    height: 540
  }

  private constraints = {
    audio: false,
    video: true
  };

  private webcamOn = true;

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
