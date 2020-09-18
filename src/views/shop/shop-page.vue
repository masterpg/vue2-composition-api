<style lang="sass" scoped>
@import 'src/styles/app.variables'

.shop-page
  padding: 12px
  body.screen--lg &, body.screen--xl &
    margin: 48px
  body.screen--md &
    margin: 24px
  body.screen--xs &, body.screen--sm &
    margin: 12px

.toggle
  border: 1px solid $primary

.title-text
  @extend %text-h6

.product-item,
.cart-item
  padding: 12px

  .title
    @extend %text-subtitle1

  .detail
    @extend %text-body2
    color: $text-secondary-color

.total-amount
  padding: 12px

  .title
    @extend %text-h6

  .detail
    @extend %text-h6
    color: $text-secondary-color

.error-text
  @extend %text-body2
  color: $text-error-color
  text-align: right
  margin: 0 20px
</style>

<template>
  <div class="shop-page layout vertical">
    <div>
      <div class="layout horizontal center">
        <div class="title-text">{{ $t('products') }}</div>
      </div>
      <hr style="width: 100%;" />
      <div v-for="product in products" :key="product.id" class="layout horizontal center product-item">
        <div class="layout vertical center-justified">
          <div class="title">{{ product.title }}</div>
          <div class="detail">
            <span>{{ $t('price') }}:</span> ¥{{ product.price }}&nbsp;/&nbsp;<span>{{ $t('stock') }}:</span>
            {{ product.stock }}
          </div>
        </div>
        <div class="flex-1"></div>
        <q-btn v-show="isSignedIn" round color="primary" size="xs" icon="add" @click="addButtonOnClick(product)" />
      </div>
    </div>

    <div v-show="!cartIsEmpty" class="app-mt-20">
      <div class="layout horizontal center">
        <div class="title-text">{{ $t('yourCurt') }}</div>
        <div class="flex-1"></div>
      </div>
      <hr style="width: 100%;" />
      <div v-for="cartItem in cartItems" :key="cartItem.id" class="layout horizontal center cart-item">
        <div class="layout vertical center-justified">
          <div class="title">{{ cartItem.title }}</div>
          <div class="detail">
            <span>{{ $t('price') }}:</span> ¥{{ cartItem.price }} x {{ cartItem.quantity }}
          </div>
        </div>
        <div class="flex-1"></div>
        <q-btn round color="primary" size="xs" icon="remove" @click="removeButtonOnClick(cartItem)" />
      </div>
    </div>

    <div v-show="!cartIsEmpty" class="app-mt-20">
      <div class="layout horizontal center">
        <div class="title-text">{{ $t('total') }}</div>
        <div class="flex-1"></div>
      </div>
      <hr style="width: 100%;" />
      <div class="layout horizontal center">
        <div class="total-amount layout horizontal center">
          <div class="detail">¥{{ cartTotalPrice }}</div>
        </div>
        <div class="error-text flex-1">{{ checkoutStatus.message }}</div>
        <q-btn v-show="!cartIsEmpty" :label="$t('checkout')" color="primary" @click="checkoutButtonOnClick" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CartItem, CheckoutStatus, LogicContainerKey, Product } from '@/logic'
import { computed, defineComponent, inject, onMounted, reactive, ref } from '@vue/composition-api'
import { Loading } from 'quasar'

interface ShopPageProps {}

export default defineComponent<ShopPageProps>({
  name: 'ShopPage',

  setup(props, context) {
    const state = reactive({})
    const logic = inject(LogicContainerKey)!

    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(async () => {
      await logic.shop.fetchProducts()
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const isSignedIn = computed(() => logic.auth.isSignedIn)

    const cartIsEmpty = computed<boolean>(() => {
      return logic.shop.cartItems.length === 0
    })

    const cartTotalPrice = computed(() => logic.shop.cartTotalPrice)

    const checkoutStatus = computed<{ result: boolean; message: string }>(() => {
      const checkoutStatus = logic.shop.checkoutStatus
      const result = checkoutStatus === CheckoutStatus.None || checkoutStatus === CheckoutStatus.Successful
      return {
        result,
        message: result ? '' : 'Checkout failed.',
      }
    })

    //----------------------------------------------------------------------
    //
    //  Event listeners
    //
    //----------------------------------------------------------------------

    async function addButtonOnClick(product: Product) {
      Loading.show()
      await logic.shop.addItemToCart(product.id)
      Loading.hide()
    }

    async function removeButtonOnClick(cartItem: CartItem) {
      Loading.show()
      await logic.shop.removeItemFromCart(cartItem.productId)
      Loading.hide()
    }

    async function checkoutButtonOnClick() {
      Loading.show()
      await logic.shop.checkout()
      Loading.hide()
    }

    //----------------------------------------------------------------------
    //
    //  Event listeners
    //
    //----------------------------------------------------------------------

    return {
      products: logic.shop.products,
      cartItems: logic.shop.cartItems,
      isSignedIn,
      cartTotalPrice,
      cartIsEmpty,
      checkoutStatus,
      addButtonOnClick,
      removeButtonOnClick,
      checkoutButtonOnClick,
    }
  },
})
</script>

<i18n>
en:
  products: "Products"
  yourCurt: "Your Curt"
  price: "Price"
  stock: "Stock"
  total: "Total"
  totalAmount: "Total Amount"
  checkout: "Checkout"
ja:
  products: "商品一覧"
  yourCurt: "あなたのカート"
  price: "価格"
  stock: "在庫"
  total: "合計"
  totalAmount: "合計金額"
  checkout: "チェックアウト"
</i18n>
