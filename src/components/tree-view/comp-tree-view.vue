<style lang="sass" scoped>
@import 'src/styles/app.variables'

.CompTreeView
  color: var(--comp-tree-view-color, $app-link-color)
  font-size: var(--comp-tree-view-font-size, 14px)
  font-weight: var(--comp-tree-font-weight, $app-link-font-weight)
  padding: var(--comp-tree-padding, 10px)
</style>

<template>
  <div
    ref="el"
    class="CompTreeView"
    :style="{ minWidth: minWidth + 'px' }"
    @node-add="onNodeAdd"
    @before-node-remove="onBeforeNodeRemove"
    @node-remove="onNodeRemove"
    @node-property-change="allNodesOnNodePropertyChange"
    @lazy-load="allNodesOnLazyLoad"
    @open-change="allNodesOnOpenChange"
    @select-change="allNodesOnSelectChange"
    @select="allNodesOnSelectDebounce"
  ></div>
</template>

<script lang="ts">
import * as util from '@/components/tree-view/comp-tree-view-utils'
import {
  ChildrenSortFunc,
  CompTreeNodeData,
  CompTreeNodeParent,
  CompTreeViewEvent,
  CompTreeViewLazyLoadDoneFunc,
  CompTreeViewLazyLoadEvent,
} from '@/components/tree-view/types'
import { CompTreeNode, CompTreeNodeIntl } from '@/components/tree-view/comp-tree-node.vue'
import { SetupContext, computed, defineComponent, getCurrentInstance, reactive, ref } from '@vue/composition-api'
import { NodePropertyChangeDetail } from '@/components/tree-view/comp-tree-view-utils'
import Vue from 'vue'
import debounce from 'lodash/debounce'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface CompTreeView<FAMILY_NODE extends CompTreeNode = CompTreeNode> extends Vue {
  /**
   * ツリービューのトップレベルのノードです。
   */
  readonly children: FAMILY_NODE[]

  /**
   * 選択ノードです。
   */
  selectedNode: FAMILY_NODE | null

  /**
   * 指定されたノードの選択状態を設定します。
   * @param value ノードを特定するための値を指定
   * @param selected 選択状態を指定
   * @param silent 選択系イベントを発火したくない場合はtrueを指定
   */
  setSelectedNode(value: string, selected: boolean, silent?: boolean): void

  /**
   * 指定されたノードデータからノードツリーを構築します。
   * @param nodeDataList ノードツリーを構築するためのデータ
   * @param options
   * <ul>
   *   <li>sortFunc: 子ノードの並びを決めるソート関数</li>
   *   <li>insertIndex: ノード挿入位置。ノードに`sortFunc`が設定されている場合、この値は無視されます。</li>
   * </ul>
   */
  buildTree(nodeDataList: CompTreeNodeData[], options?: { sortFunc?: ChildrenSortFunc; insertIndex?: number | null }): void

  /**
   * ノードを追加します。
   * @param child 追加するノード
   * @param options
   * <ul>
   *   <li>parent: 親ノードを特定するための値。指定されない場合、ツリービューの子として追加されます。</li>
   *   <li>insertIndex: ノード挿入位置。ノードに`sortFunc`が設定されている場合、この値は無視されます。</li>
   * </ul>
   */
  addNode<N extends CompTreeNode>(child: N, options?: { insertIndex?: number | null }): N

  /**
   * ノードを追加します。
   * @param child 追加ノードを構築するためのデータ
   * @param options
   * <ul>
   *   <li>parent: 親ノードを特定するための値。指定されない場合、ツリービューの子として追加されます。</li>
   *   <li>insertIndex: ノード挿入位置。ノードに`sortFunc`が設定されている場合、この値は無視されます。</li>
   * </ul>
   */
  addNode<N extends CompTreeNode = FAMILY_NODE>(child: CompTreeNodeData, options?: { parent?: string; insertIndex?: number | null }): N

  /**
   * ノードを削除します。
   * @param value ノードを特定するための値
   */
  removeNode<N extends CompTreeNode = FAMILY_NODE>(value: string): N | undefined

  /**
   * 全てのノードを削除します。
   */
  removeAllNodes(): void

  /**
   * ノードを特定するためのvalueと一致するノードを取得します。
   * @param value ノードを特定するための値
   */
  getNode<N extends CompTreeNode = FAMILY_NODE>(value: string): N | undefined

  /**
   * ツリービューの全ノードをツリー構造から平坦化した配列形式で取得します。
   */
  getAllNodes<N extends CompTreeNode = FAMILY_NODE>(): N[]
}

interface CompTreeViewIntl<FAMILY_NODE extends CompTreeNode = CompTreeNodeIntl> extends CompTreeView<FAMILY_NODE>, CompTreeNodeParent<FAMILY_NODE> {}

//========================================================================
//
//  Implementation
//
//========================================================================

/**
 * ツリーコンポーネントです。
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--comp-tree-distance` | ノードとノードの縦の間隔です | `6px`
 * `--comp-tree-indent` | ノードの左インデントです | `16px`
 * `--comp-tree-view-font-size` | ノードのフォントサイズです | `14px`
 * `--comp-tree-font-weight` | ノードのフォントの太さです | $link-font-weight
 * `--comp-tree-line-height` | ノードの行の高さです | `26px`
 * `--comp-tree-view-color` | ノードの文字色です | $link-color
 * `--comp-tree-selected-color` | ノード選択時の文字色です | `pink-5`
 * `--comp-tree-unselectable-color` | 非選択ノードの文字色です | `grey-9`
 * `--comp-tree-padding` | ツリービューのpaddingです | `10px`
 */
namespace CompTreeView {
  export const clazz = defineComponent({
    name: 'CompTreeView',

    setup: (props: {}, ctx) => setup(props, ctx),
  })

  export function setup(props: {}, ctx: SetupContext) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const self = getCurrentInstance() as CompTreeViewIntl
    const el = ref<HTMLElement>()
    const childContainer = el

    const state = reactive({
      children: [] as CompTreeNode[],

      /**
       * ツリービューが管理する全ノードのマップです。
       * key: ノードを特定するための値, value: ノード
       */
      allNodeDict: {} as { [key: string]: CompTreeNode },

      selectedNode: null as CompTreeNode | null,

      sortFunc: null as ChildrenSortFunc | null,
    })

    /**
     * ツリービューの最小幅です。
     */
    const minWidth = computed(() => {
      let result = 0
      for (const child of children.value) {
        if (result < child.minWidth) {
          result = child.minWidth
        }
      }
      return result + util.getElementFrameWidth(childContainer.value!)
    })

    const sortFunc = computed(() => state.sortFunc)

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const children = computed(() => state.children)

    const selectedNode = computed({
      get: () => state.selectedNode,
      set: node => {
        const currentSelectedNode = state.selectedNode

        // 選択ノードが指定された場合
        if (node) {
          // 現在の選択ノードと指定されたノードが違う場合
          if (currentSelectedNode && currentSelectedNode !== node) {
            // 現在の選択ノードを非選択にする
            currentSelectedNode.selected = false
          }
          // 指定されたノードを選択状態に設定
          node.selected = true
          state.selectedNode = node
        }
        // 選択ノードが指定されたなかった場合
        else {
          // 現在の選択ノードを非選択にする
          if (currentSelectedNode) {
            currentSelectedNode.selected = false
          }
          state.selectedNode = null
        }
      },
    })

    const setSelectedNode: CompTreeViewIntl['setSelectedNode'] = (value, selected, silent = false) => {
      const node = getNode(value)
      if (!node) return

      const currentSelectedNode = selectedNode.value

      // 選択状態にする場合
      if (selected) {
        // 現在の選択ノードと指定されたノードが違う場合
        if (currentSelectedNode && currentSelectedNode !== node) {
          // 現在の選択ノードを非選択にする
          currentSelectedNode.setSelected(false, silent)
        }
        // 指定されたノードを選択状態に設定
        node.setSelected(true, silent)
        state.selectedNode = node
      }
      // 非選択状態にする場合
      else {
        // 指定されたノードを非選択にする
        node.setSelected(false, silent)
        if (currentSelectedNode === node) {
          state.selectedNode = null
        }
      }
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const buildTree: CompTreeViewIntl['buildTree'] = (nodeDataList, options) => {
      state.sortFunc = options?.sortFunc ?? null
      let insertIndex = options?.insertIndex

      nodeDataList.forEach(nodeData => {
        addNodeByData(nodeData, { insertIndex })
        if (typeof insertIndex === 'number') {
          insertIndex++
        }
      })
    }

    const addNode: CompTreeViewIntl['addNode'] = (
      node: CompTreeNodeData | CompTreeNode,
      options?: { parent?: string; insertIndex?: number | null }
    ) => {
      options = options || {}

      let result!: CompTreeNode
      const childType = node instanceof Vue ? 'Node' : 'Data'

      // 親が指定されている場合
      // (親を特定する値が空文字の場合があるのでtypeofを使用している)
      if (typeof options.parent === 'string') {
        const parentNode = getNode(options.parent)
        if (!parentNode) {
          throw new Error(`The parent node '${options.parent}' does not exist.`)
        }
        result = parentNode.addChild(node as CompTreeNode, options)
      }
      // 親が指定されていない場合
      else {
        // 引数のノードがノードコンポーネントで指定された場合
        if (childType === 'Node') {
          result = addNodeByNode(node as CompTreeNodeIntl, options)
        }
        // 引数のノードがノードデータで指定された場合
        else if (childType === 'Data') {
          result = addNodeByData(node as CompTreeNodeData, options)
        }
      }

      return result
    }

    const removeNode: CompTreeViewIntl['removeNode'] = value => {
      const node = getNode(value)
      if (!node) return

      // 親がツリービューの場合
      // (node.parentが空の場合、親はツリービュー)
      if (!node.parent) {
        removeChildFromContainer(node)
        util.dispatchNodeRemove(self, node)
      }
      // 親がノードの場合
      else {
        node.parent.removeChild(node)
      }

      return node as any
    }

    const removeAllNodes: CompTreeViewIntl['removeAllNodes'] = () => {
      for (const node of Object.values(state.allNodeDict)) {
        removeNode(node.value)
      }
    }

    const getNode: CompTreeViewIntl['getNode'] = value => {
      return state.allNodeDict[value] as any
    }

    const getAllNodes: CompTreeViewIntl['getAllNodes'] = () => {
      const result: CompTreeNode[] = []
      for (const child of state.children) {
        result.push(child as CompTreeNode)
        result.push(...util.getDescendants(child as CompTreeNode))
      }
      return result as any
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function addNodeByData(nodeData: CompTreeNodeData, options?: { insertIndex?: number | null }): CompTreeNode {
      if (getNode(nodeData.value)) {
        throw new Error(`The node '${nodeData.value}' already exists.`)
      }

      // ノードの作成
      const node = util.newCompTreeNode(nodeData)

      // ノード挿入位置を決定
      const insertIndex = getInsertIndex(node, options)

      // コンテナにノードを追加
      insertChildIntoContainer(node, insertIndex)

      // 子ノードの設定
      const len = nodeData.children ? nodeData.children.length : 0
      for (let i = 0; i < len; i++) {
        node.addChild(nodeData.children![i], { insertIndex: i })
      }

      // ノードが追加されたことを通知するイベントを発火
      util.dispatchNodeAdd(node)

      return node
    }

    function addNodeByNode(node: CompTreeNodeIntl, options?: { insertIndex?: number | null }): CompTreeNode {
      // 追加ノードの親が自身のツリービューの場合
      // ※自身のツリービューの子として追加ノードが既に存在する場合
      if (!node.parent && node.treeView === self) {
        const newInsertIndex = getInsertIndex(node, options)
        const currentIndex = children.value.indexOf(node)
        // 現在の位置と新しい挿入位置が同じ場合
        if (currentIndex === newInsertIndex) {
          util.dispatchNodeAdd(node)
          for (const descendant of util.getDescendants(node)) {
            util.dispatchNodeAdd(descendant)
          }
          return node
        }
      }

      //
      // 前の親から追加ノードを削除
      //
      if (node.parent) {
        // 親ノードから追加ノードを削除
        node.parent.removeChild(node)
      } else {
        // 親ノードがない場合ツリービューが親となるので、ツリービューから自ノードを削除
        node.treeView && node.treeView.removeNode(node.value)
      }

      // ノード挿入位置を決定
      const insertIndex = getInsertIndex(node, options)

      // コンテナにノードを追加
      insertChildIntoContainer(node, insertIndex)

      // 子ノードの設定
      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i]
        node.addChild(childNode, { insertIndex: i })
      }

      // ノードが追加されたことを通知するイベントを発火
      util.dispatchNodeAdd(node)

      return node
    }

    function getInsertIndex(newNode: CompTreeNode, options?: { insertIndex?: number | null }): number {
      // ソート関数が指定されている場合
      if (typeof sortFunc.value === 'function') {
        const newChildren: CompTreeNode[] = []
        if (children.value.includes(newNode)) {
          newChildren.push(...(children.value as CompTreeNode[]))
        } else {
          newChildren.push(...(children.value as CompTreeNode[]), newNode)
        }
        newChildren.sort(sortFunc.value)
        return newChildren.indexOf(newNode)
      }
      // 挿入位置が指定された場合
      else if (typeof options?.insertIndex === 'number') {
        return options.insertIndex
      }
      // 何も指定されていなかった場合
      else {
        return children.value.length
      }
    }

    /**
     * コンテナへノードを挿入します。
     * @param node 追加するノード
     * @param insertIndex ノード挿入位置
     */
    function insertChildIntoContainer(node: CompTreeNodeIntl, insertIndex: number): void {
      const childrenLength = childContainer.value!.children.length

      // 挿入位置が大きすぎないかを検証
      if (childrenLength < insertIndex) {
        throw new Error('insertIndex is too big.')
      }

      // コンテナにノードを追加
      if (childrenLength === insertIndex) {
        childContainer.value!.appendChild(node.el)
      } else {
        const afterNode = childContainer.value!.children[insertIndex]
        childContainer.value!.insertBefore(node.el, afterNode)
      }

      children.value.splice(insertIndex, 0, node)

      // ルートノードにツリービューを設定
      node.setTreeView(self)

      // 最年長ノードフラグを再設定
      restIsEldest()
    }

    /**
     * コンテナからノードを削除します。
     * @node 削除するノード
     */
    function removeChildFromContainer(node: CompTreeNodeIntl): void {
      // ツリービューまたはツリービューの親がアンマウントされると、
      // ツリービュー内の要素を取得できない場合がある。このような状況を考慮し、
      // 要素の存在チェックをしてから指定されたノードの削除を行っている。
      childContainer.value && childContainer.value.removeChild(node.$el)

      const index = children.value.indexOf(node)
      if (index >= 0) {
        children.value.splice(index, 1)
      }

      // ルートノードのツリービューをクリア
      node.setTreeView(null)

      // 最年長ノードフラグを再設定
      restIsEldest()
    }

    /**
     * ノードが発火する標準のイベントとは別に、独自イベント用のリスナを登録します。
     * @param eventName
     */
    function addExtraNodeEventListener(eventName: string): void {
      childContainer.value!.removeEventListener(eventName, allNodesOnExtraNodeEvent)
      childContainer.value!.addEventListener(eventName, allNodesOnExtraNodeEvent)
    }

    /**
     * 最年長ノードフラグを再設定します。
     */
    function restIsEldest(): void {
      state.children.forEach((node, index) => {
        node.isEldest = index === 0
      })
    }

    //----------------------------------------------------------------------
    //
    //  Event listeners
    //
    //----------------------------------------------------------------------

    /**
     * ツリービューにノードが追加された際のリスナです。
     * @param e
     */
    function onNodeAdd(e: any) {
      e.stopImmediatePropagation()

      const node = e.target.__vue__ as CompTreeNodeIntl
      state.allNodeDict[node.value] = node

      // ノードが発火する独自イベントの設定
      for (const eventName of node.extraEventNames) {
        addExtraNodeEventListener(eventName)
      }

      if (node.selected) {
        selectedNode.value = node
      }
    }

    /**
     * ツリービューからノードが削除される直前のリスナです。
     * @param e
     */
    function onBeforeNodeRemove(e: any) {
      e.stopImmediatePropagation()

      const node = e.detail.node as CompTreeNode

      const nodeDescendants = [node, ...node.getDescendants()]
      for (const iNode of nodeDescendants) {
        if (selectedNode.value === iNode) {
          selectedNode.value = null
          break
        }
      }
    }

    /**
     * ツリービューからノードが削除された際のリスナです。
     * @param e
     */
    function onNodeRemove(e: any) {
      e.stopImmediatePropagation()

      const node = e.detail.node as CompTreeNode
      for (const descendant of util.getDescendants(node)) {
        delete state.allNodeDict[descendant.value]
      }
      delete state.allNodeDict[node.value]
    }

    /**
     * ノードでnode-property-changeイベントが発火した際のリスナです。
     * @param e
     */
    function allNodesOnNodePropertyChange(e: any) {
      e.stopImmediatePropagation()

      const node = e.target.__vue__ as CompTreeNode
      const detail = e.detail as NodePropertyChangeDetail

      if (detail.property === 'value') {
        delete state.allNodeDict[detail.oldValue]
        state.allNodeDict[detail.newValue] = node
      }
    }

    /**
     * ノードでnode-loadingイベントが発火した際のリスナです。
     * @param e
     */
    function allNodesOnLazyLoad(e: any) {
      e.stopImmediatePropagation()

      const node = e.target.__vue__ as CompTreeNode
      const done = e.detail.done as CompTreeViewLazyLoadDoneFunc

      ctx.emit('lazy-load', { node, done } as CompTreeViewLazyLoadEvent)
    }

    /**
     * ノードでopen-changeイベントが発火した際のリスナです。
     * @param e
     */
    function allNodesOnOpenChange(e: any) {
      e.stopImmediatePropagation()

      const node = e.target.__vue__ as CompTreeNode
      ctx.emit('open-change', { node } as CompTreeViewEvent)
    }

    /**
     * ノードでselect-changeイベントが発火した際のリスナです。
     * @param e
     */
    function allNodesOnSelectChange(e: any) {
      e.stopImmediatePropagation()

      const node = e.target.__vue__ as CompTreeNode
      const silent = e.detail.silent

      // ノードが選択された場合
      if (node.selected) {
        setSelectedNode(node.value, true, silent)
      }
      // ノードの選択が解除された場合
      else {
        if (selectedNode.value === node) {
          setSelectedNode(node.value, false, silent)
        }
      }

      !silent && ctx.emit('select-change', { node } as CompTreeViewEvent)
    }

    /**
     * ノードでselectイベントが発火した際のリスナです。
     * @param e
     */
    function allNodesOnSelect(e: any) {
      e.stopImmediatePropagation()

      const node = e.target.__vue__ as CompTreeNode
      const silent = e.detail.silent

      !silent && ctx.emit('select', { node } as CompTreeViewEvent)
    }

    const allNodesOnSelectDebounce: (e: any) => void | Promise<void> = debounce(allNodesOnSelect, 0)

    /**
     * ノードが発火する標準のイベントとは別に、独自イベントが発火した際のリスナです。
     * @param e
     */
    function allNodesOnExtraNodeEvent(e: any) {
      e.stopImmediatePropagation()

      const node = e.target.__vue__ as CompTreeNode
      const args = { node }
      if (e.detail) {
        Object.assign(args, e.detail)
      }

      ctx.emit(e.type, args)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      //--------------------------------------------------
      //  public
      //--------------------------------------------------

      children,
      selectedNode,
      setSelectedNode,
      buildTree,
      addNode,
      removeNode,
      removeAllNodes,
      getNode,
      getAllNodes,

      //--------------------------------------------------
      //  internal
      //--------------------------------------------------

      //
      // CompTreeNodeParent
      //
      el,
      childContainer,
      sortFunc,

      //--------------------------------------------------
      //  private
      //--------------------------------------------------

      minWidth,
      onNodeAdd,
      onBeforeNodeRemove,
      onNodeRemove,
      allNodesOnNodePropertyChange,
      allNodesOnLazyLoad,
      allNodesOnOpenChange,
      allNodesOnSelectChange,
      allNodesOnSelectDebounce,
    }
  }
}

export default CompTreeView.clazz
// eslint-disable-next-line no-undef
export { CompTreeView, CompTreeViewIntl }
</script>
