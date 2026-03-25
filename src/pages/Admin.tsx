import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getGuests,
  addGuest,
  editGuest,
  removeGuest,
  getContactLink,
  setContactLink,
  importGuests,
  normalize,
  type GuestRow,
  type ImportResult,
} from '../lib/guests'

const ADMIN_USER = 'ELadmin'
const ADMIN_PASS = '30052026'

type View = 'login' | 'dashboard'

export default function Admin() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('login')
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')

  const [guests, setGuests] = useState<GuestRow[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [dataError, setDataError] = useState('')

  const [newGuest, setNewGuest] = useState('')
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingOriginalName, setEditingOriginalName] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState('')

  const [filterText, setFilterText] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all')
  const [removeConfirm, setRemoveConfirm] = useState<GuestRow | null>(null)

  const [contactInput, setContactInput] = useState('')
  const [contactSaved, setContactSaved] = useState(false)

  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function refreshData() {
    setLoadingData(true)
    setDataError('')
    try {
      const data = await getGuests()
      setGuests(data)
    } catch {
      setDataError('Erro ao carregar dados. Verifique sua conexão.')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (view === 'dashboard') {
      refreshData()
      ;(async () => {
        try {
          const link = await getContactLink()
          setContactInput(link)
        } catch {
          setContactInput('')
        }
      })()
    }
  }, [view])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      setView('dashboard')
    } else {
      setLoginError('Usuário ou senha incorretos.')
    }
  }

  function handleLogout() {
    setView('login')
    setLoginUser('')
    setLoginPass('')
    setLoginError('')
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')
    if (!newGuest.trim()) { setAddError('Digite um nome.'); return }

    setSaving(true)
    try {
      const ok = await addGuest(newGuest)
      if (!ok) {
        setAddError('Este convidado já está na lista.')
      } else {
        setAddSuccess(`"${newGuest.trim()}" adicionado com sucesso.`)
        setNewGuest('')
        await refreshData()
      }
    } catch {
      setAddError('Erro ao adicionar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(guest: GuestRow) {
    setEditingId(guest.id)
    setEditingOriginalName(guest.name)
    setEditValue(guest.name)
    setEditError('')
  }

  async function saveEdit() {
    setEditError('')
    if (!editValue.trim()) { setEditError('Nome não pode ser vazio.'); return }

    setSaving(true)
    try {
      const ok = await editGuest(editingOriginalName, editValue)
      if (!ok) {
        setEditError('Já existe um convidado com esse nome.')
      } else {
        setEditingId(null)
        await refreshData()
      }
    } catch {
      setEditError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmRemove(guest: GuestRow) {
    setSaving(true)
    try {
      await removeGuest(guest.id)
      setRemoveConfirm(null)
      await refreshData()
    } catch {
      setRemoveConfirm(null)
    } finally {
      setSaving(false)
    }
  }

  function handleSaveContact() {
    setContactSaved(false)
    ;(async () => {
      try {
        await setContactLink(contactInput)
        setContactSaved(true)
        setTimeout(() => setContactSaved(false), 2500)
      } catch {
        setContactSaved(false)
        setImportError('Erro ao salvar link de contato. Tente novamente.')
      }
    })()
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'txt'].includes(ext ?? '')) {
      setImportError('Formato inválido. Use arquivos .csv ou .txt')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setImportError('')
    setImportResult(null)
    setImporting(true)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const text = ev.target?.result as string
      if (!text?.trim()) {
        setImportError('O arquivo está vazio.')
        setImporting(false)
        return
      }
      try {
        const result = await importGuests(text)
        setImportResult(result)
        await refreshData()
      } catch {
        setImportError('Erro ao importar. Verifique o arquivo e tente novamente.')
      } finally {
        setImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.onerror = () => {
      setImportError('Erro ao ler o arquivo. Tente novamente.')
      setImporting(false)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const totalConfirmed = guests.filter(g => g.confirmed).length

  const filtered = guests.filter(g => {
    const matchText = normalize(g.name).includes(normalize(filterText))
    if (filterStatus === 'confirmed' && !g.confirmed) return false
    if (filterStatus === 'pending' && g.confirmed) return false
    return matchText
  })

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 fade-in-up">
            <img src="/monogram.png" alt="EL" className="w-20 h-20 mx-auto mb-3 drop-shadow" />
            <h1 className="font-script text-5xl text-olive-800">Eliel &amp; Larissa</h1>
            <p className="font-serif text-stone-500 mt-1 text-sm">Painel Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="card fade-in-up delay-200">
            <h2 className="font-serif font-semibold text-olive-800 text-xl text-center mb-6">Entrar</h2>
            <div className="space-y-3 mb-4">
              <input type="text" className="input-field" placeholder="Usuário" value={loginUser}
                onChange={e => { setLoginError(''); setLoginUser(e.target.value) }} autoComplete="username" />
              <input type="password" className="input-field" placeholder="Senha" value={loginPass}
                onChange={e => { setLoginError(''); setLoginPass(e.target.value) }} autoComplete="current-password" />
            </div>
            {loginError && <p className="text-red-600 text-sm text-center mb-3 fade-in">{loginError}</p>}
            <button type="submit" className="btn-primary w-full">Entrar</button>
            <p className="text-center mt-4">
              <button type="button" onClick={() => navigate('/')}
                className="text-olive-600 hover:text-olive-800 text-sm transition-colors">
                ← Voltar ao site
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-olive-800 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img src="/monogram.png" alt="EL" className="w-9 h-9 drop-shadow" />
          <div>
            <h1 className="font-serif font-semibold text-sm sm:text-base leading-tight">Eliel &amp; Larissa</h1>
            <p className="text-olive-200 text-xs">Painel Administrativo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-olive-200 hover:text-white text-sm transition-colors px-2">
            Ver site
          </button>
          <button onClick={handleLogout}
            className="bg-olive-600 hover:bg-olive-500 text-white text-sm px-3 py-1.5 rounded-full transition-colors">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Error banner */}
        {dataError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-center justify-between">
            {dataError}
            <button onClick={refreshData} className="text-red-600 underline text-xs ml-3">Tentar novamente</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 fade-in-up">
          <div className="card text-center">
            <p className="text-3xl font-bold text-olive-700 font-serif">
              {loadingData ? '—' : guests.length}
            </p>
            <p className="text-stone-500 text-sm mt-1">Total de Convidados</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600 font-serif">
              {loadingData ? '—' : totalConfirmed}
            </p>
            <p className="text-stone-500 text-sm mt-1">Presenças Confirmadas</p>
          </div>
        </div>

        {/* Add Guest */}
        <div className="card fade-in-up delay-100">
          <h2 className="font-serif font-semibold text-olive-800 text-lg mb-4">Adicionar Convidado</h2>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input type="text"
              className="input-field flex-1 text-left px-4 rounded-xl"
              placeholder="Nome do convidado"
              value={newGuest}
              onChange={e => { setAddError(''); setAddSuccess(''); setNewGuest(e.target.value) }}
              disabled={saving}
            />
            <button type="submit" className="btn-primary whitespace-nowrap disabled:opacity-60" disabled={saving}>
              {saving ? '...' : 'Adicionar'}
            </button>
          </form>
          {addError && <p className="text-red-600 text-sm mt-2">{addError}</p>}
          {addSuccess && <p className="text-green-600 text-sm mt-2">{addSuccess}</p>}
        </div>

        {/* Import List */}
        <div className="card fade-in-up delay-200">
          <h2 className="font-serif font-semibold text-olive-800 text-lg mb-1">Importar Lista</h2>
          <p className="text-stone-400 text-xs mb-4">
            Suporta <strong>.csv</strong> ou <strong>.txt</strong> com um nome por linha
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`btn-primary cursor-pointer text-sm ${importing ? 'opacity-60 pointer-events-none' : ''}`}>
              {importing ? 'Importando...' : '📂 Selecionar arquivo'}
              <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden"
                onChange={handleFileImport} disabled={importing} />
            </label>
            {importResult && (
              <button onClick={() => setImportResult(null)} className="text-stone-400 hover:text-stone-600 text-xs transition-colors">
                limpar
              </button>
            )}
          </div>
          {importError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm fade-in">
              {importError}
            </div>
          )}
          {importResult && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 fade-in">
              <p className="text-green-800 font-semibold text-sm mb-1">Importação concluída!</p>
              <div className="flex gap-4 text-sm flex-wrap">
                <span className="text-stone-600"><strong className="text-stone-800">{importResult.total}</strong> nomes lidos</span>
                <span className="text-green-700"><strong>{importResult.added}</strong> adicionados</span>
                {importResult.duplicates > 0 && (
                  <span className="text-yellow-700"><strong>{importResult.duplicates}</strong> duplicados ignorados</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contact Config */}
        <div className="card fade-in-up delay-200">
          <h2 className="font-serif font-semibold text-olive-800 text-lg mb-1">Configurar Contato</h2>
          <p className="text-stone-400 text-xs mb-4">
            Link do botão "Fale Conosco". Deixe vazio para ocultar.
          </p>
          <div className="flex gap-2">
            <input type="url"
              className="input-field flex-1 text-left px-4 rounded-xl"
              placeholder="https://wa.me/5511999999999"
              value={contactInput}
              onChange={e => { setContactSaved(false); setContactInput(e.target.value) }}
            />
            <button onClick={handleSaveContact} className="btn-primary whitespace-nowrap">Salvar</button>
          </div>
          {contactSaved && <p className="text-green-600 text-sm mt-2 fade-in">Link salvo com sucesso.</p>}
        </div>

        {/* Guest List */}
        <div className="card fade-in-up delay-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="font-serif font-semibold text-olive-800 text-lg">Lista de Convidados</h2>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'confirmed', 'pending'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    filterStatus === s ? 'bg-olive-700 text-white' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'
                  }`}>
                  {s === 'all' ? 'Todos' : s === 'confirmed' ? 'Confirmados' : 'Pendentes'}
                </button>
              ))}
            </div>
          </div>

          <input type="text"
            className="input-field text-left px-4 rounded-xl mb-4 text-sm"
            placeholder="Buscar convidado..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />

          {loadingData ? (
            <div className="text-center py-10 text-stone-400 text-sm">
              <div className="w-6 h-6 border-2 border-olive-300 border-t-olive-600 rounded-full animate-spin mx-auto mb-3" />
              Carregando convidados...
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">Nenhum convidado encontrado.</p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-olive-100">
                    <th className="text-left py-2 px-2 text-stone-500 font-medium">#</th>
                    <th className="text-left py-2 px-2 text-stone-500 font-medium">Nome</th>
                    <th className="text-left py-2 px-2 text-stone-500 font-medium">Status</th>
                    <th className="text-right py-2 px-2 text-stone-500 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((guest, i) => {
                    const isEditing = editingId === guest.id
                    return (
                      <tr key={guest.id} className="border-b border-olive-50 hover:bg-olive-50/50 transition-colors">
                        <td className="py-2.5 px-2 text-stone-400">{i + 1}</td>
                        <td className="py-2.5 px-2">
                          {isEditing ? (
                            <input type="text"
                              className="border border-olive-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-olive-400 w-full"
                              value={editValue}
                              onChange={e => { setEditError(''); setEditValue(e.target.value) }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveEdit()
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium text-stone-800">{guest.name}</span>
                          )}
                          {isEditing && editError && (
                            <p className="text-red-500 text-xs mt-1">{editError}</p>
                          )}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            guest.confirmed ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${guest.confirmed ? 'bg-green-500' : 'bg-stone-400'}`} />
                            {guest.confirmed ? 'Confirmado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex gap-1 justify-end">
                            {isEditing ? (
                              <>
                                <button onClick={saveEdit} disabled={saving}
                                  className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50">
                                  Salvar
                                </button>
                                <button onClick={() => setEditingId(null)}
                                  className="text-stone-400 hover:text-stone-600 text-xs px-2 py-1 rounded hover:bg-stone-50 transition-colors">
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(guest)}
                                  className="text-olive-600 hover:text-olive-800 text-xs font-medium px-2 py-1 rounded hover:bg-olive-50 transition-colors">
                                  Editar
                                </button>
                                <button onClick={() => setRemoveConfirm(guest)}
                                  className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">
                                  Remover
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Remove Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-serif font-semibold text-stone-800 text-lg mb-2">Remover convidado?</h3>
            <p className="text-stone-500 text-sm mb-6">
              Tem certeza que deseja remover <strong>"{removeConfirm.name}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveConfirm(null)}
                className="btn-outline flex-1 py-2.5 text-sm" disabled={saving}>
                Cancelar
              </button>
              <button onClick={() => confirmRemove(removeConfirm)} disabled={saving}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-full text-sm font-medium transition-colors disabled:opacity-60">
                {saving ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
