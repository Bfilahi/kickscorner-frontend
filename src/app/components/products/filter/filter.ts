import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { BrandResponse } from '../../../model/response/brand-response';
import { HttpErrorResponse } from '@angular/common/http';
import { SizeResponse } from '../../../model/response/size-response';
import { ColorResponse } from '../../../model/response/color-response';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product-service';
import { ProductResponse } from '../../../model/response/product-response';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.html',
  styleUrl: './filter.css'
})
export class Filter implements OnInit{

  @Input() showFilter: boolean = false;
  @Input() partialParams: {page: number, size: number, sort: string, direction: string} = {
    page: 1,
    size: 10,
    sort: '',
    direction: '',
  };
  @Input() sorting: string = '';
  @Input() sortingEvent!: Observable<string>;
  @Output() showFilterChange = new EventEmitter<boolean>();
  @Output() getProducts = new EventEmitter<ProductResponse[]>();

  public brands: BrandResponse[] = [];
  public sizes: SizeResponse[] = [];
  public colors: ColorResponse[] = [];

  public selectedBrands: number[] = [];
  public selectedSizes: number[] = [];
  public selectedColors: number[] = [];


  constructor(
    private adminProductService: AdminProductService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private spinnerService: NgxSpinnerService
  ){}


  ngOnInit(): void {
    this.listBrands();
    this.listSizes();
    this.listColors();

    this.sortingEvent.subscribe(sorting => {
      this.spinnerService.show();
      this.sorting = sorting;
      if(this.sorting !== '')
        this.showResults();
      else
        this.spinnerService.hide();
    });
  }


  private listBrands(){
    this.adminProductService.getBrands().subscribe({
      next: (response: BrandResponse[]) => {
        this.brands = response;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) =>{
        console.error(err);
      }
    });
  }

  private listSizes(){
    this.adminProductService.getSizes().subscribe({
      next: (response: SizeResponse[]) => {
        this.sizes = response;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
  }

  private listColors(){
    this.adminProductService.getColors().subscribe({
      next: (response: ColorResponse[]) => {
        this.colors = response;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    })
  }

  public showResults(){
    switch(this.sorting){
      case 'oldest': 
        this.partialParams.sort = 'createdAt';
        this.partialParams.direction = 'asc';
        break;
      case 'newest':
        this.partialParams.sort = 'createdAt';
        this.partialParams.direction = 'desc';
        break;
      case 'highToLow':
        this.partialParams.sort = 'price';
        this.partialParams.direction = 'desc';
        break;
      case 'lowToHigh':
        this.partialParams.sort = 'price';
        this.partialParams.direction = 'asc';
        break;
    }


<<<<<<< HEAD
    this.partialParams.page = 1;  // added this
    this.partialParams.size = 10; // added this

=======
>>>>>>> 56438dde39ab7a255a9c9f35755d747a971ff9d7
    this.productService.getFilteredProducts(this.partialParams, this.selectedBrands, this.selectedSizes, this.selectedColors)
      .subscribe({
        next: (response: any) => {
          this.getProducts.emit(response);
          this.spinnerService.hide();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err.error);
          this.spinnerService.hide();
        }
      });
  }

  public onItemChange(event: Event, id: number, items: number[]){
    const target = event.target as HTMLInputElement;

    if(target.checked)
      items.push(id);
    else{
      const index = items.indexOf(id);
      if(index !== -1)
        items.splice(index, 1);
    }
  }

  public clearFilters(){
    this.selectedBrands = [];
    this.selectedColors = [];
    this.selectedSizes = [];
  }

}
