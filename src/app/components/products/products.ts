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
export class Products implements OnInit{

  public showFilter: boolean = false;
  public isLoading: boolean = true;
  public sortingSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public products: ProductResponse[] = [];
  public partialParams: {page: number, size: number, sort: string, direction: string} = {
    page: 1,
    size: 10,
    sort: '',
    direction: '',
  };
  public totalItems: number = 0;

  private selectedBrands: number[] = [];
  private selectedSizes: number[] = [];
  private selectedColors: number[] = [];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private spinnerService: NgxSpinnerService
  ){}


  ngOnInit(): void {
    this.spinnerService.show();
    this.listProducts();
  }

  get showingStart(): number{
    if(!this.totalItems || this.totalItems === 0 )
      return 0;
    return (this.partialParams.page - 1) * (this.partialParams.size) + 1;
  }

  get showingEnd(): number{
    if(!this.totalItems || this.totalItems === 0 )
      return 0;
    const end = this.partialParams.page * this.partialParams.size;
    return Math.min(end, this.totalItems);
  }


  public onSortChange(event: Event){
    const target = event.target as HTMLInputElement;

    if(target)
      this.sortingSubject.next(target.value);
  }

  public updateProducts(response: any){
    this.products = response.response.content;
    this.partialParams.page = response.response.number + 1;
    this.partialParams.size = response.response.size;
    this.totalItems = response.response.totalElements;

    this.selectedBrands = response.selectedBrands;
    this.selectedSizes = response.selectedSizes;
    this.selectedColors = response.selectedColors;

    console.log('response from updateProducts', response);
  }

  public onPageChange(page: number){
    this.partialParams.page = page;
    console.log(this.partialParams.page);
    console.log(this.partialParams.size);
    this.listProducts();
  }

  private listProducts(){
      this.productService.getFilteredProducts(this.partialParams, this.selectedBrands, this.selectedSizes, this.selectedColors).subscribe({
      next: (response: any) => {
        this.products = response.content;
        this.partialParams.page = response.number + 1;
        this.partialParams.size = response.size;
        this.totalItems = response.totalElements;

        this.cdr.detectChanges();

        this.spinnerService.hide();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
  }

}
