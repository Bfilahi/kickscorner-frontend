import { AfterViewInit, Component, ElementRef, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeroService } from '../../../services/home/hero-service';
import { gsap } from 'gsap';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero implements AfterViewInit {

  @ViewChild('canvas', {static: true})
  public canvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('title', {static: true})
  public title!: ElementRef<HTMLElement>;

  @ViewChild('hero2', {static: true}) 
  public hero2!: ElementRef<HTMLElement>;

  private platformId: Object = inject(PLATFORM_ID);


  public constructor( private heroService: HeroService ){}



  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {

      // Small delay to ensure DOM is fully ready
      setTimeout(() => {
        this.initializeScene();
      }, 100);
    }
  }

  private initializeScene(): void {
    if (this.canvas) {
      this.heroService.createScene(this.canvas);
      this.heroService.animate();

      this.animateTitle();
    }
  }

  private animateTitle(){
    const titleElements = this.title.nativeElement.querySelectorAll('.title');
    
    gsap.from(titleElements, {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.2,
      ease: "back.out(1.7)",
      delay: 1
    });
  }

  public scrollToHero2(){
    this.hero2.nativeElement.scrollIntoView({behavior: 'smooth'});
  }

  public ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.heroService.cleanup();
    }
  }
}
