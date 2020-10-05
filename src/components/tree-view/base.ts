import { CompTreeNode, CompTreeNodeIntl } from '@/components/tree-view/comp-tree-node.vue'
import { CompTreeViewIntl } from '@/components/tree-view/comp-tree-view.vue'
import { Constructor } from 'web-base-lib'
import Vue from 'vue'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface CompTreeNodeData {
  /**
   * ノードのラベルを指定します。
   */
  label: string
  /**
   * ノードがを特定するための値を指定します。
   */
  value: string
  /**
   * 非選択なノードか否かを指定します。
   * デフォルトは選択可能なので、非選択にしたい場合にtrueを設定します。
   */
  unselectable?: boolean
  /**
   * ノードが選択されているか否かを指定します。
   */
  selected?: boolean
  /**
   * ノードが開いているか否かを指定します。
   * デフォルトは閉じているので、開いた状態にしたい場合にtrueを設定します。
   */
  opened?: boolean
  /**
   * アイコン名を指定します。
   * https://material.io/tools/icons/?style=baseline
   */
  icon?: string
  /**
   * アイコンの色を指定します。
   * 例: primary, indigo-8
   */
  iconColor?: string
  /**
   * CompTreeNodeを拡張した場合、拡張したノードのクラスを指定します。
   */
  nodeClass?: Constructor
  /**
   * 子ノードを指定します。
   */
  children?: this[]
  /**
   * 子ノードの読み込みを遅延ロードするか否かを指定します。
   */
  lazy?: boolean
  /**
   * 子ノード読み込みの遅延ロード状態を指定します。
   */
  lazyLoadStatus?: CompTreeViewLazyLoadStatus
  /**
   * 子ノードの並びを決めるソート関数を指定します。
   */
  sortFunc?: ChildrenSortFunc<any> | null
}

type CompTreeNodeEditData<T> = Partial<Omit<T, 'nodeClass' | 'children'>>

type ChildrenSortFunc<N extends CompTreeNode = CompTreeNode> = (a: N, b: N) => number

interface CompTreeViewEvent<N extends CompTreeNode = CompTreeNode> {
  node: N
}

type CompTreeViewLazyLoadStatus = 'none' | 'loading' | 'loaded'

type CompTreeViewLazyLoadDoneFunc = () => void

interface CompTreeViewLazyLoadEvent<N extends CompTreeNode = CompTreeNode> {
  node: N
  done: CompTreeViewLazyLoadDoneFunc
}

//--------------------------------------------------
//  tree-view Internal
//--------------------------------------------------

interface CompTreeNodeParent<FAMILY_NODE extends CompTreeNodeIntl = CompTreeNodeIntl> {
  readonly el: HTMLElement
  readonly children: FAMILY_NODE[]
  readonly childContainer: HTMLElement
  getSortFunc<N extends CompTreeNode = FAMILY_NODE>(): ChildrenSortFunc<N> | null
  sortChildren(): void
  /**
   * 指定ノードの親コンテナ内における配置位置を再設定します。
   * この関数は以下の条件に一致する場合に呼び出す必要があります。
   * + 親ノードがソート関数によって子ノードの並びを決定している場合
   * + 指定ノードのプロパティ変更がソート関数に影響を及ぼす場合
   * @param node
   */
  resetNodePositionInParent(node: FAMILY_NODE): void
}

interface NodePropertyChangeDetail {
  property: 'value' | 'label'
  oldValue: any
  newValue: any
}

//========================================================================
//
//  Implementations
//
//========================================================================

/**
 * ノードを作成します。
 * @param nodeData
 */
function newCompTreeNode<N extends CompTreeNode = CompTreeNodeIntl>(nodeData: CompTreeNodeData): N {
  // プログラム的にコンポーネントのインスタンスを生成
  // https://css-tricks.com/creating-vue-js-component-instances-programmatically/
  const NodeClass = Vue.extend(nodeData.nodeClass || CompTreeNode.clazz)
  const node = new NodeClass() as any
  node.init(nodeData)
  node.$mount()
  return node
}

/**
 * 指定されたノードの子孫を配列で取得します。
 * @param node
 */
function getDescendants<N extends CompTreeNode = CompTreeNodeIntl>(node: CompTreeNode): N[] {
  const getChildren = (node: N) => {
    const result: N[] = []
    for (const child of (node as any).children) {
      result.push(child)
      result.push(...getChildren(child))
    }
    return result
  }

  const result: N[] = []
  for (const child of (node as any).children) {
    result.push(child)
    result.push(...getChildren(child))
  }
  return result
}

/**
 * 指定されたノードの子孫をマップで取得します。
 * @param node
 */
function getDescendantDict<N extends CompTreeNode = CompTreeNodeIntl>(node: CompTreeNode): { [value: string]: N } {
  const getChildren = (node: N, result: { [value: string]: N }) => {
    for (const child of (node as any).children) {
      result[child.value] = child
      getChildren(child, result)
    }
    return result
  }

  const result: { [value: string]: N } = {}
  for (const child of (node as any).children) {
    result[child.value] = child
    getChildren(child, result)
  }
  return result
}

/**
 * ノードが追加された旨を通知するイベントを発火します。
 * @param node
 */
function dispatchNodeAdd(node: CompTreeNodeIntl): void {
  node.el.dispatchEvent(
    new CustomEvent('node-add', {
      bubbles: true,
      cancelable: true,
      composed: true,
    })
  )
}

/**
 * ノードが削除される直前を通知するイベントを発火します。
 * @param parent
 * @param child
 */
function dispatchBeforeNodeRemove(parent: CompTreeViewIntl | CompTreeNodeIntl, child: CompTreeNode): void {
  parent.el.dispatchEvent(
    new CustomEvent('before-node-remove', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { node: child },
    })
  )
}

/**
 * ノードが削除された旨を通知するイベントを発火します。
 * @param parent
 * @param child
 */
function dispatchNodeRemove(parent: CompTreeViewIntl | CompTreeNodeIntl, child: CompTreeNode): void {
  parent.el.dispatchEvent(
    new CustomEvent('node-remove', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { node: child },
    })
  )
}

/**
 * ノードの選択が変更された旨を通知するイベントを発火します。
 * @param target
 * @param silent
 */
function dispatchSelectChange(target: CompTreeNodeIntl, silent: boolean): void {
  target.el.dispatchEvent(
    new CustomEvent('select-change', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { silent },
    })
  )
}

/**
 * ノードの選択された旨を通知するイベントを発火します。
 * @param target
 * @param silent
 */
function dispatchSelect(target: CompTreeNodeIntl, silent: boolean): void {
  target.el.dispatchEvent(
    new CustomEvent('select', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { silent },
    })
  )
}

/**
 * ノードのプロパティが変更された旨を通知するイベントを発火します。
 * @param target
 * @param detail
 */
function dispatchNodePropertyChange(target: CompTreeNodeIntl, detail: NodePropertyChangeDetail): void {
  target.el.dispatchEvent(
    new CustomEvent('node-property-change', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail,
    })
  )
}

/**
 * ノードの遅延ローディングが開始された旨を通知するイベントを発火します。
 * @param target
 * @param done
 */
function dispatchLazyLoad(target: CompTreeNodeIntl, done: CompTreeViewLazyLoadDoneFunc): void {
  target.el.dispatchEvent(
    new CustomEvent('lazy-load', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { done },
    })
  )
}

/**
 * 指定されたスタイルの幅を取得します。
 * @param style
 */
function getElementWidth(style: CSSStyleDeclaration): number

/**
 * 指定された要素の幅を取得します。
 * @param element
 */
function getElementWidth(element: Element): number

function getElementWidth(elementOrStyle: Element | CSSStyleDeclaration): number {
  if (!elementOrStyle) return 0
  let result = 0
  let style: CSSStyleDeclaration
  if (elementOrStyle instanceof Element) {
    style = getComputedStyle(elementOrStyle)
  } else {
    style = elementOrStyle as CSSStyleDeclaration
  }
  result += toFloat(style.getPropertyValue('width'))
  result += getElementFrameWidth(style)
  return result
}

/**
 * 指定されたスタイルの枠の幅を取得します。
 * @param style
 */
function getElementFrameWidth(style: CSSStyleDeclaration): number

/**
 * 指定された要素の枠の幅を取得します。
 * @param element
 */
function getElementFrameWidth(element: Element): number

function getElementFrameWidth(elementOrStyle: Element | CSSStyleDeclaration): number {
  if (!elementOrStyle) return 0
  let result = 0
  let style: CSSStyleDeclaration
  if (elementOrStyle instanceof Element) {
    style = getComputedStyle(elementOrStyle)
  } else {
    style = elementOrStyle as CSSStyleDeclaration
  }
  result += toFloat(style.getPropertyValue('border-left-width'))
  result += toFloat(style.getPropertyValue('border-right-width'))
  result += toFloat(style.getPropertyValue('margin-left'))
  result += toFloat(style.getPropertyValue('margin-right'))
  result += toFloat(style.getPropertyValue('padding-left'))
  result += toFloat(style.getPropertyValue('padding-right'))
  return result
}

/**
 * 指定された要素の高さを取得します。
 * @param element
 */
function getElementHeight(element: Element): number

/**
 * 指定されたスタイルの高さを取得します。
 * @param style
 */
function getElementHeight(style: CSSStyleDeclaration): number

function getElementHeight(elementOrStyle: Element | CSSStyleDeclaration): number {
  if (!elementOrStyle) return 0
  let result = 0
  let style: CSSStyleDeclaration
  if (elementOrStyle instanceof Element) {
    style = getComputedStyle(elementOrStyle)
  } else {
    style = elementOrStyle as CSSStyleDeclaration
  }
  result += toFloat(style.getPropertyValue('height'))
  result += getElementFrameHeight(style)
  return result
}

/**
 * 指定された要素の枠の高さを取得します。
 * @param element
 */
function getElementFrameHeight(element: Element): number

/**
 * 指定されたスタイルの枠の高さを取得します。
 * @param style
 */
function getElementFrameHeight(style: CSSStyleDeclaration): number

function getElementFrameHeight(elementOrStyle: Element | CSSStyleDeclaration): number {
  if (!elementOrStyle) return 0
  let result = 0
  let style: CSSStyleDeclaration
  if (elementOrStyle instanceof Element) {
    style = getComputedStyle(elementOrStyle)
  } else {
    style = elementOrStyle as CSSStyleDeclaration
  }
  result += toFloat(style.getPropertyValue('border-left-height'))
  result += toFloat(style.getPropertyValue('border-right-height'))
  result += toFloat(style.getPropertyValue('margin-top'))
  result += toFloat(style.getPropertyValue('margin-bottom'))
  result += toFloat(style.getPropertyValue('padding-top'))
  result += toFloat(style.getPropertyValue('padding-bottom'))
  return result
}

/**
 * 文字列を浮動小数点数へ変換します。
 * @param value
 */
function toFloat(value?: string): number {
  const result = parseFloat(value || '0')
  return isNaN(result) ? 0 : result
}

//========================================================================
//
//  Export
//
//========================================================================

export {
  ChildrenSortFunc,
  CompTreeNodeData,
  CompTreeNodeEditData,
  CompTreeNodeParent,
  CompTreeViewEvent,
  CompTreeViewLazyLoadDoneFunc,
  CompTreeViewLazyLoadEvent,
  CompTreeViewLazyLoadStatus,
  NodePropertyChangeDetail,
  dispatchBeforeNodeRemove,
  dispatchLazyLoad,
  dispatchNodeAdd,
  dispatchNodePropertyChange,
  dispatchNodeRemove,
  dispatchSelect,
  dispatchSelectChange,
  getDescendantDict,
  getDescendants,
  getElementFrameHeight,
  getElementFrameWidth,
  getElementHeight,
  getElementWidth,
  newCompTreeNode,
  toFloat,
}
