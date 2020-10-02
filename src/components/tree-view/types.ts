import { CompTreeNode } from '@/components/tree-view/comp-tree-node.vue'
import { Constructor } from 'web-base-lib'

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
  sortFunc?: ChildrenSortFunc<any>
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

interface CompTreeNodeParent<FAMILY_NODE extends CompTreeNode = CompTreeNode> {
  readonly el: HTMLElement
  readonly children: FAMILY_NODE[]
  readonly sortFunc: ChildrenSortFunc | null
  readonly childContainer: HTMLElement
  getInsertIndex(newNode: FAMILY_NODE, options?: { insertIndex?: number | null }): number
}

//========================================================================
//
//  Exports
//
//========================================================================

export {
  CompTreeNodeData,
  CompTreeNodeEditData,
  ChildrenSortFunc,
  CompTreeViewEvent,
  CompTreeViewLazyLoadStatus,
  CompTreeViewLazyLoadDoneFunc,
  CompTreeViewLazyLoadEvent,
  CompTreeNodeParent,
}
