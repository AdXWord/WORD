'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, Modifier, ContentState } from 'draft-js'
import 'draft-js/dist/Draft.css'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Table, Printer, FileDown, SpellCheck, Search, Settings, Moon, Sun, File, FolderOpen, Save } from 'lucide-react'

export default function LinuxWord() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())
  const [documentName, setDocumentName] = useState('Untitled Document')
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const editor = useRef(null)

  useEffect(() => {
    if (editor.current) {
      editor.current.focus()
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      setEditorState(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style))
  }

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType))
  }

  const saveDocument = () => {
    const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    localStorage.setItem(documentName, content)
    alert('Document saved!')
  }

  const loadDocument = () => {
    const content = localStorage.getItem(documentName)
    if (content) {
      const parsedContent = JSON.parse(content)
      setEditorState(EditorState.createWithContent(convertFromRaw(parsedContent)))
      alert('Document loaded!')
    } else {
      alert('No document found with this name.')
    }
  }

  const newDocument = () => {
    setEditorState(EditorState.createEmpty())
    setDocumentName('Untitled Document')
  }

  const insertTable = () => {
    const contentState = editorState.getCurrentContent()
    const contentStateWithTable = Modifier.insertText(
      contentState,
      editorState.getSelection(),
      '\n|   |   |   |\n|---|---|---|\n|   |   |   |\n|   |   |   |\n'
    )
    setEditorState(EditorState.push(editorState, contentStateWithTable, 'insert-characters'))
  }

  const printDocument = () => {
    window.print()
  }

  const exportDocument = () => {
    const content = editorState.getCurrentContent().getPlainText('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${documentName}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const spellCheck = () => {
    // This is a placeholder for spell check functionality
    alert('Spell check would be implemented here using a spell check library.')
  }

  const searchAndReplace = () => {
    const contentState = editorState.getCurrentContent()
    const selectionsToReplace = []
    const blockMap = contentState.getBlockMap()

    blockMap.forEach((contentBlock) => {
      const text = contentBlock.getText()
      let matchArr, start
      const regex = new RegExp(searchTerm, 'g')
      while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index
        const end = start + matchArr[0].length
        const selection = {
          start,
          end,
          blockKey: contentBlock.getKey(),
        }
        selectionsToReplace.push(selection)
      }
    })

    let newContentState = contentState
    selectionsToReplace.forEach((selection) => {
      const targetRange = {
        start: selection.start,
        end: selection.end,
      }
      const blockKey = selection.blockKey
      const selectionState = {
        anchorKey: blockKey,
        anchorOffset: targetRange.start,
        focusKey: blockKey,
        focusOffset: targetRange.end,
      }
      newContentState = Modifier.replaceText(
        newContentState,
        selectionState,
        replaceTerm
      )
    })

    const newEditorState = EditorState.push(editorState, newContentState, 'replace-text')
    setEditorState(newEditorState)
  }

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'dark' : ''}`}>
      <div className="mb-4 flex items-center space-x-2">
        <Input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          className="w-64"
          placeholder="Document Name"
        />
        <Button onClick={newDocument}><File size={16} /> New</Button>
        <Button onClick={loadDocument}><FolderOpen size={16} /> Open</Button>
        <Button onClick={saveDocument}><Save size={16} /> Save</Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline"><Settings size={16} /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Customize your LinuxWord experience
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Tabs defaultValue="home" className="w-full">
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="insert">Insert</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button onClick={() => toggleInlineStyle('BOLD')}><Bold size={16} /></Button>
            <Button onClick={() => toggleInlineStyle('ITALIC')}><Italic size={16} /></Button>
            <Button onClick={() => toggleInlineStyle('UNDERLINE')}><Underline size={16} /></Button>
            <Button onClick={() => toggleBlockType('header-one')}>H1</Button>
            <Button onClick={() => toggleBlockType('header-two')}>H2</Button>
            <Button onClick={() => toggleBlockType('header-three')}>H3</Button>
            <Button onClick={() => toggleBlockType('unordered-list-item')}><List size={16} /></Button>
            <Button onClick={() => toggleBlockType('left')}><AlignLeft size={16} /></Button>
            <Button onClick={() => toggleBlockType('center')}><AlignCenter size={16} /></Button>
            <Button onClick={() => toggleBlockType('right')}><AlignRight size={16} /></Button>
          </div>
        </TabsContent>
        <TabsContent value="insert" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button onClick={insertTable}><Table size={16} /> Insert Table</Button>
          </div>
        </TabsContent>
        <TabsContent value="review" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button onClick={spellCheck}><SpellCheck size={16} /> Spell Check</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Search size={16} /> Search and Replace</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Search and Replace</DialogTitle>
                  <DialogDescription>
                    Enter the text to search for and the text to replace it with.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="search" className="text-right">
                      Search
                    </Label>
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="replace" className="text-right">
                      Replace
                    </Label>
                    <Input
                      id="replace"
                      value={replaceTerm}
                      onChange={(e) => setReplaceTerm(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={searchAndReplace}>Replace All</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
      <div className="border p-4 min-h-[500px] mt-4">
        <Editor
          ref={editor}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          placeholder="Start typing here..."
        />
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <Button onClick={printDocument}><Printer size={16} /> Print</Button>
        <Button onClick={exportDocument}><FileDown size={16} /> Export</Button>
      </div>
    </div>
  )
}
