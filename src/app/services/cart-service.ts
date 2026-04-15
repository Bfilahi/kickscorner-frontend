import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CartItem } from '../model/cart-item';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private isBrowser: boolean = false;

  private cartItemsSubject: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();


  constructor(@Inject(PLATFORM_ID) platformId: Object){
    this.isBrowser = isPlatformBrowser(platformId);

    if(this.isBrowser){
      const cartItems = JSON.parse(localStorage.getItem('cartItems')!);

      if(cartItems != null)
        this.cartItemsSubject.next(cartItems);
    }
  }


  public addToCart(cartItem: CartItem){
    let isInCart: boolean = false;
    let cart: CartItem[] = this.cartItemsSubject.value;

    const existingCartItem: CartItem | undefined = cart.find(item => item.id === cartItem.id && item.selectedSize === cartItem.selectedSize);
    isInCart = existingCartItem != null;

    if(existingCartItem)
      this.incrementQuantity(existingCartItem);
    else
      cart = [...cart, cartItem];

    this.cartItemsSubject.next(cart);

    this.persistCartItems();
  }


  public removeFromCart(cartItem: CartItem){
    let cartItems: CartItem[] = this.cartItemsSubject.value;
    cartItems = cartItems.filter(i => !(i.id === cartItem.id && i.selectedSize === cartItem.selectedSize));

    this.cartItemsSubject.next(cartItems);

    if(cartItems.length <= 0)
      this.clearCart();
    else
      this.persistCartItems();
  }

  public incrementQuantity(cartItem: CartItem){
    cartItem.quantity++;

    this.persistCartItems();
  }

  public decrementQuantity(cartItem: CartItem){
    cartItem.quantity--;

    if(cartItem.quantity <= 0)
      this.removeFromCart(cartItem);
    else
      this.persistCartItems();
  }

  public clearCart(){
    this.cartItemsSubject.next([]);

    if(this.isBrowser)
      localStorage.removeItem('cartItems');
  }

  public getTotal(): number{
    let total: number = 0;
    const cart: CartItem[] = this.cartItemsSubject.value;
    cart.forEach(i => {
      if(i.price)
        total += i.price * i.quantity
    });
    return total;
  }

  private persistCartItems(){
    if(this.isBrowser)
      localStorage.setItem('cartItems', JSON.stringify(this.cartItemsSubject.value));
  }

}
