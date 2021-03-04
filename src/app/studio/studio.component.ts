import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-studio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit {

  @ViewChild('studioCanvas', { static: true }) studioCanvas: ElementRef;
  @ViewChild('webcamStudio', { static: false }) webcamStudio: ElementRef<HTMLVideoElement>;

  private context: CanvasRenderingContext2D;
  private constraints = {
    audio: false,
    video: true
  };

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setCanvasContext();
    this.initWebCam();
  }

  private setCanvasContext(): void {
    this.context = this.studioCanvas.nativeElement.getContext('2d');
  }

  private initWebCam(): void {
    const that = this;

    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then(function(stream){
        // window['stream'] = stream; // make stream available to browser console
        that.webcamStudio.nativeElement.srcObject = stream;
        requestAnimationFrame(() => {
          that.context.drawImage(that.webcamStudio.nativeElement, 0, 0, that.studioCanvas.nativeElement.width, that.studioCanvas.nativeElement.height);
        });

      })
      .catch(function(error) {
        console.error('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
      });
  }

}
