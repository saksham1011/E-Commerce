/*
  Javascript file for the logic of the ecommerce website.

  This app has the functionality of displaying items from local JSON file.
  When a user clicks on add to cart button that item gets added to the cart and the cart opens up
  displaying the item user has added. When the item is added, add to cart button for that item gets
  disabled and user can add or remove the same item from the cart itself by clicking the plus and 
  minus icons.
  In the cart user can see the number of items and the amount/price of individual items and total
  price of all the items.
  
  This app uses the local storage for storing the items in the cart.

*/


//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const itemsCart = document.querySelector('.items');
const cartTotal = document.querySelector('.cart-total');
const productsList = document.querySelector('.products-list');
const cartContent = document.querySelector('.cart-content');
const removeItemBtn = document.querySelector('.remove-item');
const bodyOverlay = document.querySelector('#body');

//cart
let cart = [];

//buttons
let buttonsDOM = [];

//getting thr products
class Products {
  async getProducts() {
    try {
      let result = await fetch('./Data/4-products.json')
      let data = await result.json();
      let items = data.products;
      items = items.map(item => {
        const { id, title } = item;
        const { variants: [{ price }] } = item;
        const { variants: [{ featured_image: { src } }] } = item;
        // Pulling colors from the json array
        // var { colors = item.variants.map(opt => ({ option: opt.option1 })) } = item;
        // return { id, title, price, src, colors }
        return { id, title, price, src }
      });
      return items;
    } catch (error) {
      console.log(error);
    }
  }
}
//display products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      // Mapping the colors array with objects as a normal array
      // const options = product.colors.map(x => x.option)
      result += `
      <div class="col-lg-3 col-sm-6 col-xs-12 product">
        <img src="${product.src}" class="img-fluid mx-auto d-block" alt="${product.title}" />
        <div class="mx-auto d-flex justify-content-between product-details">
          <p class="product-title">${product.title}</p>
          <p class="product-price">$${product.price}</p>
        </div>
        <div class="mx-auto d-grid add-to-cart-btn-container">
          <button type="button" class="add-to-cart" data-id=${product.id}>
            Add to cart
          </button>
        </div>
        </div>
      </div>`
    });
    productsList.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll('.add-to-cart')];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id == id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart"
        event.target.disabled = true
        // get the product from products using id
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // maybe show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = "$" + parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    itemsCart.innerText = "(" + itemsTotal + " Items)";
  }
  
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <div class="flex-shrink-0">
        <img src="${item.src}" alt="${item.title}" class="img-fluid mx-auto d-block" />
      </div>
      <div class="flex-grow-1 ms-4">
        <h4>${item.title}</h4>
        <div class="d-flex justify-content-between pill">
          <i class="bi bi-dash-lg flex-shrink-0 ms-3" data-id="${item.id}"></i>
          <p class="item-amount flex-grow-0">${item.amount}</p>
          <i class="bi bi-plus-lg flex-shrink-0 me-3" data-id="${item.id}"></i>
        </div>
      </div>
      <div class="">
        <i class="bi bi-x-lg remove-item align-self-baseline float-end" data-id="${item.id}"></i>
        <h5 class="align-bottom">$${item.price}</h5>
      </div>
      </div>
        `
    cartContent.append(div);
  }

  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
    bodyOverlay.classList.add('noscroll');
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.poulateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  poulateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
    bodyOverlay.classList.remove('noscroll');
  }

  cartLogic() {
    // cart functionality
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement)
        this.removeItem(id);
      }
      else if (event.target.classList.contains('bi-plus-lg')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id == id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.previousElementSibling.innerText = tempItem.amount;
      }
      else if (event.target.classList.contains('bi-dash-lg')) {
        let lowerAmout = event.target;
        let id = lowerAmout.dataset.id;
        let tempItem = cart.find(item => item.id == id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmout.nextElementSibling.innerText = tempItem.amount;
        }
        else {
          cartContent.removeChild(lowerAmout.parentElement.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    })
  }

  cartItemRemove() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
  }

  removeItem(id) {
    cart = cart.filter(item => item.id != id); // should be triple equals 
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `Add to cart`
  }


  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id == id);
  }

}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id == id); // should be triple equals 
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  //setup app
  ui.setupApp();

  //get all products
  products.getProducts().then(products => {
    ui.displayProducts(products);
    Storage.saveProducts(products)
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  });
})
