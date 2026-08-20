import { Component } from '@angular/core';
import * as siteData from '../../data.json';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-carousel',
  imports: [SlickCarouselModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent {

  data = {
    carouselImage: 'https://placehold.co/170x45'
  }

  news: any = (siteData as any).default;
  slideConfig = { "slidesToShow": 1, "slidesToScroll": 1, "dots": true, "autoplay": true};

  slickInit(e: any) {
    console.log('slick initialized');
  }

  breakpoint(e: any) {
    console.log('breakpoint');
  }

  afterChange(e: any) {
    console.log('afterChange');
  }

  beforeChange(e: any) {
    console.log('beforeChange');
  }
}
