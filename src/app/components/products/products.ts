import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Filter } from "./filter/filter";
import { ProductResponse } from '../../model/response/product-response';
import { ProductService } from '../../services/product-service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, Filter, NgxSpinnerModule, NgxPaginationModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  public showFilter: boolean = false;
  public isLoading: boolean = true;
  public sortingSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public products: ProductResponse[] = [];
  public partialParams: { page: number, size: number, sort: string, direction: string } = {
    page: 1,
    size: 10,
    sort: '',
    direction: '',
  };
  public totalItems: number = 0;

  private currentBrands: number[] = [];
  private currentSizes: number[] = [];
  private currentColors: number[] = [];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private spinnerService: NgxSpinnerService
  ) { }


  ngOnInit(): void {
    this.listProducts();
  }

  get showingStart(): number {
    if (!this.totalItems || this.totalItems === 0)
      return 0;
    return (this.partialParams.page - 1) * (this.partialParams.size) + 1;
  }

  get showingEnd(): number {
    if (!this.totalItems || this.totalItems === 0)
      return 0;
    const end = this.partialParams.page * this.partialParams.size;
    return Math.min(end, this.totalItems);
  }


  public onSortChange(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target)
      this.sortingSubject.next(target.value);
  }

  public updateProducts(event: {response: any, brands: number[], sizes: number[], colors: number[]}) {
    this.currentBrands = event.brands;
    this.currentSizes = event.sizes;
    this.currentColors = event.colors;

    this.products = event.response.content;
    this.partialParams.page = event.response.page.number + 1;
    this.partialParams.size = event.response.page.size;
    this.totalItems = event.response.page.totalElements;

    this.cdr.detectChanges();
  }

  public onPageChange(page: number) {
    this.partialParams.page = page;
    this.listProducts();
  }

  public resetToDefault() {
    this.currentBrands = [];
    this.currentSizes = [];
    this.currentColors = [];
    this.partialParams.page = 1;
    this.listProducts();
  }

  private listProducts() {
    this.spinnerService.show();

    const request$ = this.hasActiveFilters()
      ? this.productService.getFilteredProducts(this.partialParams, this.currentBrands, this.currentSizes, this.currentColors)
      : this.productService.getProducts(this.partialParams);

    request$.subscribe({
      next: (response: any) => {
        this.products = response.content;
        this.partialParams.page = response.page.number + 1;
        this.partialParams.size = response.page.size;
        this.totalItems = response.page.totalElements;

        this.cdr.detectChanges();

        this.spinnerService.hide();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.spinnerService.hide();
        console.error(err);
      }
    });
  }

  private hasActiveFilters(): boolean {
    return this.currentBrands.length > 0 ||
      this.currentSizes.length > 0 ||
      this.currentColors.length > 0;
  }

}
