import { Panel, PanelGroup } from 'react-resizable-panels'
import React, { FC, lazy, Suspense } from 'react'
import useScopeValue from '@/shared/hooks/use-scope-value'
import SourceEditor from '@/features/source-editor/components/source-editor'
import { useEditorManagerContext } from '@/features/ide-react/context/editor-manager-context'
import { useEditorOpenDocContext } from '@/features/ide-react/context/editor-open-doc-context'
import { EditorScopeValue } from '@/features/ide-react/scope-adapters/editor-manager-context-adapter'
import classNames from 'classnames'
import { LoadingPane } from '@/features/ide-react/components/editor/loading-pane'
import { FullSizeLoadingSpinner } from '@/shared/components/loading-spinner'
import { VerticalResizeHandle } from '@/features/ide-react/components/resize/vertical-resize-handle'
import { useFileTreeOpenContext } from '@/features/ide-react/context/file-tree-open-context'

const SymbolPalettePane = lazy(
  () => import('@/features/ide-react/components/editor/symbol-palette-pane')
)

export const EditorPane: FC = () => {
  const [editor] = useScopeValue<EditorScopeValue>('editor')
  const { selectedEntityCount, openEntity } = useFileTreeOpenContext()
  const { isLoading } = useEditorManagerContext()
  const { currentDocumentId } = useEditorOpenDocContext()

  if (!currentDocumentId) {
    return null
  }

  return (
    <div
      className={classNames('ide-react-editor-content', 'full-size', {
        hidden: openEntity?.type !== 'doc' || selectedEntityCount !== 1,
      })}
    >
      <PanelGroup autoSaveId="ide-editor-layout" direction="vertical">
        <Panel
          id="panel-source-editor"
          order={1}
          className="ide-react-editor-panel"
        >
          <SourceEditor />
          {isLoading && <LoadingPane />}
        </Panel>

        {editor.showSymbolPalette && (
          <>
            <VerticalResizeHandle id="editor-symbol-palette" />
            <Panel
              id="panel-symbol-palette"
              order={2}
              defaultSize={25}
              minSize={10}
              maxSize={50}
            >
              <Suspense fallback={<FullSizeLoadingSpinner delay={500} />}>
                <SymbolPalettePane />
              </Suspense>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  )
}
