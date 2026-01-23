import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductResponse } from '../../../model/response/product-response';
import { ProductService } from '../../../services/product-service';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule, NgxPaginationModule],
  templateUrl: './products-list.html',
  styleUrl: './products-list.css'
})
export class ProductsList implements OnInit{

  public products: ProductResponse[] = [];
  public isLoading: boolean = true;
  public tableHeaders = ['Name', 'Brand', 'Color', 'Price', 'N. in stock', 'Images', 'Actions'];
  public partialParams: {page: number, size: number, sort: string, direction: string} = {
    page: 1,
    size: 10,
    sort: '',
    direction: '',
  };
  public totalItems: number = 0;


  constructor(
    private productService: ProductService,
    private adminProductService: AdminProductService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private spinnerService: NgxSpinnerService
  ){}

  
  ngOnInit(): void {
    this.listProducts(this.partialParams);
  }


  private listProducts(partialParams: {page: number, size: number, sort: string, direction: string}){
    this.spinnerService.show();

    this.productService.getProducts(partialParams).subscribe({
      next: (response: any) => {
        this.products = response.content;
        this.totalItems = response.page.totalElements;
        this.partialParams.page = response.page.number + 1;
        this.partialParams.size = response.page.size;

        this.cdr.detectChanges();

        this.spinnerService.hide();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        
        this.spinnerService.hide();
        this.isLoading = false;
      }
    });
  }


  public onPageChange(page: number){
    this.partialParams.page = page;
    this.listProducts(this.partialParams);
  }


  public delete(id: number){
    if(!confirm('Are you sure you want to delete this product?'))
      return;

    this.spinnerService.show();
    this.isLoading = true;

    this.adminProductService.deleteProduct(id).subscribe({
      next: () => {
        const deletedProduct = this.products.find(p => p.id === id);
        this.products = this.products.filter(p => p.id !== id);
        this.cdr.detectChanges();

        this.spinnerService.hide();
        this.isLoading = false;

        this.toastr.success(deletedProduct?.name, 'Product deleted successfully', {progressBar: true});
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);

        this.spinnerService.hide();
        this.isLoading = false;

        this.toastr.error(err.error.message, 'Error:', {progressBar: true});
      }
    });
  }
}