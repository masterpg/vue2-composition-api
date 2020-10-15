<template>
  <div>
    <MessageDialog ref="messageDialog" />
  </div>
</template>

<script lang="ts">
import { InjectionKey, Ref, SetupContext, defineComponent, inject, onMounted, provide, ref, watch } from '@vue/composition-api'
import { Dialog } from '@/components/dialog'
import { MessageDialog } from '@/dialogs/message.vue'
import { Route } from 'vue-router'
import { VueRouter } from 'vue-router/types/router'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface Dialogs {
  /**
   * 現在URLにURLに付与されているダイアログクエリを取得します。
   */
  getQuery(): { dialogName: DialogNames; dialogParams?: any } | undefined

  /**
   * 現在URLに付与されているダイアログクエリを削除します。
   */
  clearQuery(): void

  readonly message: { open: MessageDialog['open'] }
}

type DialogNames = 'message'

interface Props {}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace Dialogs {
  export const clazz = defineComponent({
    name: 'Dialogs',

    components: {
      MessageDialog: MessageDialog.clazz,
    },

    setup: (props: Props, ctx) => setup(props, ctx),
  })

  export function setup(props: Props, ctx: SetupContext): Dialogs {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const router: VueRouter = ctx.root.$router

    const messageDialog = ref() as Ref<MessageDialog>

    const dialogs: { [name: string]: Ref<Dialog<any, any>> } = {
      message: messageDialog,
    }

    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(() => {
      openDialogByCurrentRoute()
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const getQuery: Dialogs['getQuery'] = () => {
      const dialogName = router.currentRoute.query.dialogName as DialogNames | undefined
      if (!dialogName) return

      let dialogParams: {} | undefined
      const paramStr = router.currentRoute.query.dialogParams as string
      if (paramStr) {
        dialogParams = JSON.parse(decodeURIComponent(paramStr))
      }
      return { dialogName, dialogParams }
    }

    const clearQuery: Dialogs['clearQuery'] = () => {
      const query = { ...router.currentRoute.query }
      delete query.dialogName
      delete query.dialogParams
      router.push({
        path: router.currentRoute.path,
        query,
      })
    }

    const message: Dialogs['message'] = {
      open: params => messageDialog.value.open(params),
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    /**
     * ダイアログを開くためのクエリをURLに付与してダイアログを開きます。
     *
     * URLに付与するダイアログクエリの例:
     *   https://example.com/views/abc-page?dialogName=signIn&dialogParams=%257B%2522account%2522%253A%2522taro%2522%257D
     *
     * @param dialogName ダイアログの名前
     * @param dialogParams ダイアログに渡すパラメータ
     */
    function openDialog(dialogName: string, dialogParams?: any): Promise<any> {
      return new Promise((resolve, reject) => {
        // ダイアログへの遷移を監視
        const stopWatch = watch(
          () => ctx.root.$route,
          (route: Route) => {
            // 監視を終了
            stopWatch()

            // URLからダイアログクエリを取得
            const info = getQuery()
            if (!info) {
              reject(new Error('The dialog query could not be retrieved from the URL.'))
              return
            }

            // URLからダイアログクエリが取得できた場合、対象ダイアログのインスタンスを取得
            const dialog = dialogs[info.dialogName]
            if (!dialog) {
              reject(new Error(`There is no dialog named ${info.dialogName}.`))
              return
            }

            // ダイアログを開く
            dialog.value.open(info.dialogParams).then(result => {
              // ダイアログが閉じられたら、URLからダイアログクエリを削除
              clearQuery()
              // ダイアログが閉じられたことを通知
              resolve(result)
            })
          }
        )

        // 引数で指定されたダイアログへ遷移開始
        router.push({
          path: router.currentRoute.path,
          query: Object.assign({}, router.currentRoute.query, {
            dialogName,
            dialogParams: dialogParams ? encodeURIComponent(JSON.stringify(dialogParams)) : undefined,
          }),
        })
      })
    }

    /**
     * 指定されたルートのURLからダイアログ情報を取得し、
     * ダイアログ情報が取得された場合はそのダイアログを開きます。
     */
    function openDialogByCurrentRoute() {
      // URLからダイアログクエリを取得
      const info = getQuery()
      if (!info) return

      // URLからダイアログクエリが取得できた場合、対象ダイアログのインスタンスを取得
      const dialog = dialogs[info.dialogName]
      if (!dialog) {
        console.warn(`There is no dialog named ${info.dialogName}.`)
        return
      }

      // ダイアログを開く
      dialog.value.open(info.dialogParams).then(() => {
        // ダイアログが閉じられたら、URLからダイアログクエリを削除
        clearQuery()
      })
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result: Dialogs = {
      getQuery,
      clearQuery,
      message,
    }

    return {
      ...result,
      messageDialog,
    } as Dialogs
  }

  /**
   * ダイアログを開くためのクエリを生成します。
   *
   * ダイアログクエリの例:
   *   dialogName=signIn&dialogParams=%257B%2522account%2522%253A%2522taro%2522%257D
   *
   * @param dialogName ダイアログの名前
   * @param dialogParams ダイアログに渡すパラメータ
   */
  export function createQuery(dialogName: DialogNames, dialogParams?: any): string {
    let result = `dialogName=${dialogName}`
    if (dialogParams) {
      result += `&dialogParams=${encodeURIComponent(JSON.stringify(dialogParams))}`
    }
    return result
  }
}

//========================================================================
//
//  Dependency Injection
//
//========================================================================

const DialogsKey: InjectionKey<Dialogs> = Symbol('Dialogs')

function provideDialogs(dialogsRef: Ref<Dialogs | undefined>): void {
  const dialogsWrapper = ((dialogsRef: Ref<Dialogs | undefined>) => {
    const getQuery: Dialogs['getQuery'] = () => {
      validateDialogsRef()
      return dialogsRef.value!.getQuery()
    }

    const clearQuery: Dialogs['clearQuery'] = () => {
      validateDialogsRef()
      dialogsRef.value!.clearQuery()
    }

    const message: Dialogs['message'] = {
      open: params => {
        validateDialogsRef()
        return dialogsRef.value!.message.open(params)
      },
    }

    function validateDialogsRef(): void {
      if (!dialogsRef.value) {
        throw new Error('Dialogs has not yet been instantiated.')
      }
    }

    const result: Dialogs = {
      getQuery,
      clearQuery,
      message,
    }

    return result
  })(dialogsRef)

  provide(DialogsKey, dialogsWrapper)
}

function injectDialogs(): Dialogs {
  validateDialogsRefProvided()
  return inject(DialogsKey)!
}

function validateDialogsRefProvided(): void {
  const value = inject(DialogsKey)
  if (!value) {
    throw new Error(`${DialogsKey.description} is not provided`)
  }
}

//========================================================================
//
//  Exports
//
//========================================================================

export default Dialogs.clazz
export { Dialogs, DialogsKey, injectDialogs, provideDialogs, validateDialogsRefProvided }
</script>
