import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Tv,
  X,
  Upload,
  Check,
  RefreshCw,
  FolderSync,
  FolderOpen,
  FolderCheck,
  LogOut,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Camera,
} from "lucide-react";
import { FamilyPhoto } from "../types";
import {
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  initAuth,
} from "../lib/googleAuth";
import {
  googleDriveService,
  GoogleDriveFolder,
  GoogleDriveFile,
  DEFAULT_DRIVE_FOLDER_ID,
  DEFAULT_DRIVE_FOLDER_NAME,
  DEFAULT_DRIVE_FOLDER_URL,
} from "../lib/googleDriveService";
import { soundEffects } from "../lib/soundEffects";
import { User } from "firebase/auth";

interface PhotosViewProps {
  photos: FamilyPhoto[];
  onAddPhoto: (photo: Omit<FamilyPhoto, "id">) => void;
  onDeletePhoto: (id: string) => void;
  onStartSlideshow: () => void;
  onSyncDrivePhotos?: (photos: FamilyPhoto[]) => void;
}

export const PhotosView: React.FC<PhotosViewProps> = ({
  photos = [],
  onAddPhoto,
  onDeletePhoto,
  onStartSlideshow,
  onSyncDrivePhotos,
}) => {
  const safePhotos = photos || [];
  const [activeFilter, setActiveFilter] = useState<"all" | "drive" | "local">("all");

  // Add Photo Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive Integration State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem("allday_drive_last_sync") || null;
  });

  const [folderName, setFolderName] = useState<string>(() => {
    return localStorage.getItem("allday_drive_folder_name") || DEFAULT_DRIVE_FOLDER_NAME;
  });
  const [matchedFolder, setMatchedFolder] = useState<GoogleDriveFolder | null>(() => {
    const savedId = localStorage.getItem("allday_drive_folder_id") || DEFAULT_DRIVE_FOLDER_ID;
    const savedName = localStorage.getItem("allday_drive_folder_name") || DEFAULT_DRIVE_FOLDER_NAME;
    return { id: savedId, name: savedName };
  });
  const [availableFolders, setAvailableFolders] = useState<GoogleDriveFolder[]>([]);
  const [isSearchingFolder, setIsSearchingFolder] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // Sample Images for manual fallback
  const sampleImages = [
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1200&q=80",
  ];

  // Helper for notification messages
  const showFeedback = (msg: string) => {
    setSyncStatusMsg(msg);
    setTimeout(() => setSyncStatusMsg(null), 5000);
  };

  // Sync photos from Google Drive folder
  const syncPhotosFromFolder = useCallback(
    async (folderId: string, token: string) => {
      setIsSyncing(true);
      try {
        const driveFiles = await googleDriveService.listPhotosInFolder(
          token,
          folderId
        );

        if (driveFiles.length === 0) {
          showFeedback(
            `Pasta encontrada, mas não há fotos nela ainda. Adicione fotos em formato JPG/PNG na pasta "Proteção de Tela" do seu Google Drive!`
          );
          if (onSyncDrivePhotos) {
            onSyncDrivePhotos([]);
          }
          return;
        }

        const convertedPhotos = await googleDriveService.preloadPhotoUrls(
          token,
          driveFiles
        );

        const newFamilyPhotos: FamilyPhoto[] = convertedPhotos.map((p) => ({
          id: p.id,
          title: p.title,
          url: p.url,
          caption: p.caption,
          dateAdded: new Date().toISOString().split("T")[0],
          source: "google_drive",
          driveFileId: p.id.replace("gdrive_", ""),
        }));

        if (onSyncDrivePhotos) {
          onSyncDrivePhotos(newFamilyPhotos);
        }

        const nowStr = new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setLastSyncTime(nowStr);
        localStorage.setItem("allday_drive_last_sync", nowStr);

        soundEffects.playSuccessTone();
        showFeedback(
          `✅ ${newFamilyPhotos.length} foto(s) sincronizada(s) da pasta "${folderName}" com sucesso!`
        );
      } catch (err: any) {
        console.error("Erro ao sincronizar fotos do Google Drive:", err);
        showFeedback(
          "Falha ao carregar fotos do Drive. Verifique a conexão e tente novamente."
        );
      } finally {
        setIsSyncing(false);
      }
    },
    [folderName, onSyncDrivePhotos]
  );

  // Search for folder in Google Drive
  const searchAndConnectFolder = useCallback(
    async (token: string, nameToSearch: string = folderName) => {
      setIsSearchingFolder(true);
      try {
        const folder = await googleDriveService.findFolderByName(
          token,
          nameToSearch
        );
        if (folder) {
          setMatchedFolder(folder);
          localStorage.setItem("allday_drive_folder_id", folder.id);
          localStorage.setItem("allday_drive_folder_name", folder.name);
          await syncPhotosFromFolder(folder.id, token);
        } else {
          setMatchedFolder(null);
          // Fetch user's folders so they can select
          const allFolders = await googleDriveService.listUserFolders(token);
          setAvailableFolders(allFolders);
          showFeedback(
            `Pasta "${nameToSearch}" não foi encontrada no Drive. Crie a pasta no Google Drive ou selecione uma existente abaixo.`
          );
        }
      } catch (e: any) {
        console.error("Erro ao pesquisar pasta:", e);
      } finally {
        setIsSearchingFolder(false);
      }
    },
    [folderName, syncPhotosFromFolder]
  );

  // Auth state listener
  useEffect(() => {
    const unsub = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        const savedFolderId = localStorage.getItem("allday_drive_folder_id");
        const savedFolderName = localStorage.getItem("allday_drive_folder_name");

        if (savedFolderId && savedFolderName) {
          setMatchedFolder({ id: savedFolderId, name: savedFolderName });
          setFolderName(savedFolderName);
          await syncPhotosFromFolder(savedFolderId, token);
        } else {
          setMatchedFolder({ id: DEFAULT_DRIVE_FOLDER_ID, name: DEFAULT_DRIVE_FOLDER_NAME });
          setFolderName(DEFAULT_DRIVE_FOLDER_NAME);
          await syncPhotosFromFolder(DEFAULT_DRIVE_FOLDER_ID, token);
        }
      },
      () => {
        setCurrentUser(null);
        setMatchedFolder(null);
      }
    );

    return () => unsub();
  }, [searchAndConnectFolder, syncPhotosFromFolder]);

  // Periodic Auto-Sync (Every 5 minutes while connected)
  useEffect(() => {
    if (!currentUser || !matchedFolder) return;

    const interval = setInterval(async () => {
      const token = await getAccessToken();
      if (token && matchedFolder) {
        syncPhotosFromFolder(matchedFolder.id, token);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser, matchedFolder, syncPhotosFromFolder]);

  // Google Login Action
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        soundEffects.playSuccessTone();
        setMatchedFolder({
          id: DEFAULT_DRIVE_FOLDER_ID,
          name: DEFAULT_DRIVE_FOLDER_NAME,
        });
        setFolderName(DEFAULT_DRIVE_FOLDER_NAME);
        localStorage.setItem("allday_drive_folder_id", DEFAULT_DRIVE_FOLDER_ID);
        localStorage.setItem("allday_drive_folder_name", DEFAULT_DRIVE_FOLDER_NAME);
        await syncPhotosFromFolder(DEFAULT_DRIVE_FOLDER_ID, res.accessToken);
      }
    } catch (err: any) {
      console.error("Erro de login:", err);
      showFeedback("Não foi possível conectar com o Google Drive.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google Logout Action
  const handleGoogleLogout = async () => {
    const confirmLogout = window.confirm(
      "Deseja desconectar sua conta do Google Drive deste painel?"
    );
    if (!confirmLogout) return;

    await logoutGoogle();
    googleDriveService.clearCache();
    setCurrentUser(null);
    setMatchedFolder(null);
    localStorage.removeItem("allday_drive_folder_id");
    localStorage.removeItem("allday_drive_folder_name");
    localStorage.removeItem("allday_drive_last_sync");
    showFeedback("Google Drive desconectado com sucesso.");
  };

  // Manual Trigger Sync
  const handleManualSync = async () => {
    const token = await getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    if (matchedFolder) {
      await syncPhotosFromFolder(matchedFolder.id, token);
    } else {
      await searchAndConnectFolder(token, folderName);
    }
  };

  // Select folder from list
  const handleSelectFolder = async (folder: GoogleDriveFolder) => {
    setMatchedFolder(folder);
    setFolderName(folder.name);
    setShowFolderPicker(false);
    localStorage.setItem("allday_drive_folder_id", folder.id);
    localStorage.setItem("allday_drive_folder_name", folder.name);

    const token = await getAccessToken();
    if (token) {
      await syncPhotosFromFolder(folder.id, token);
    }
  };

  // File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    onAddPhoto({
      title: title.trim() || "Foto de Família",
      url: url.trim(),
      caption: caption.trim() || undefined,
      dateAdded: new Date().toISOString().split("T")[0],
      source: "upload",
    });

    setTitle("");
    setUrl("");
    setCaption("");
    setIsModalOpen(false);
  };

  // Filtered Photos List
  const filteredPhotos = safePhotos.filter((p) => {
    if (activeFilter === "drive") return p.source === "google_drive";
    if (activeFilter === "local") return p.source !== "google_drive";
    return true;
  });

  const drivePhotosCount = safePhotos.filter(
    (p) => p.source === "google_drive"
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Memórias & Galeria da Família</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Porta-Retrato Digital da Casa
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Sincronize com sua pasta no Google Drive ou envie fotos locais para o descanso de tela.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onStartSlideshow}
            className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer transition-all active:scale-95"
            title="Iniciar descanso de tela em tela cheia agora"
          >
            <Tv className="w-4 h-4" />
            <span>Iniciar Porta-Retrato</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto Local</span>
          </button>
        </div>
      </div>

      {/* GOOGLE DRIVE SYNC CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <FolderSync className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Sincronização com Google Drive
                </h3>
                {currentUser && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Conectado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pasta alvo:{" "}
                <strong className="text-slate-200">
                  {matchedFolder ? matchedFolder.name : "Proteção de Tela"}
                </strong>{" "}
                (
                <a
                  href={DEFAULT_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline inline-flex items-center gap-0.5"
                  title="Abrir pasta no Google Drive"
                >
                  <span>abrir no Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                ) • Ao adicionar ou remover fotos na pasta do Drive, o descanso de tela atualiza automaticamente.
              </p>
            </div>
          </div>

          {/* Connect / Actions */}
          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>
                  {isLoggingIn
                    ? "Conectando..."
                    : "Conectar com Google Drive"}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href={DEFAULT_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Abrir pasta no Google Drive em uma nova aba"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Pasta no Drive</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
                  title="Atualizar fotos agora a partir do Google Drive"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  <span>{isSyncing ? "Sincronizando..." : "Sincronizar Agora"}</span>
                </button>

                <button
                  onClick={handleGoogleLogout}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                  title="Desconectar conta Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status / Folder Information */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-300 uppercase">
                  {currentUser.email ? currentUser.email[0] : "G"}
                </div>
                <div className="truncate">
                  <p className="text-slate-400 text-[10px]">Conta Google:</p>
                  <p className="font-semibold text-white truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[10px]">Pasta Conectada:</p>
                  <p className="font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
                    <FolderCheck className="w-4 h-4 text-emerald-400" />
                    <span>{matchedFolder ? matchedFolder.name : "Procurando..."}</span>
                  </p>
                </div>
                {availableFolders.length > 0 && (
                  <button
                    onClick={() => setShowFolderPicker(!showFolderPicker)}
                    className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Trocar
                  </button>
                )}
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[10px]">Fotos no Drive:</p>
                  <p className="font-bold text-white text-sm">
                    {drivePhotosCount} foto(s)
                  </p>
                </div>
                {lastSyncTime && (
                  <span className="text-[10px] text-slate-500">
                    Última sincronização: {lastSyncTime}
                  </span>
                )}
              </div>
            </div>

            {/* Folder Selector Dropdown (if multiple or searching) */}
            {showFolderPicker && availableFolders.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-300">
                  Selecione a pasta do seu Google Drive que contém as fotos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {availableFolders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFolder(f)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                        matchedFolder?.id === f.id
                          ? "bg-amber-500/10 border-amber-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Folder Missing Helper */}
            {!matchedFolder && !isSearchingFolder && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Pasta "Proteção de Tela" não encontrada no seu Google Drive
                </p>
                <p className="text-slate-300">
                  1. Abra o seu <strong>Google Drive</strong> pelo celular ou computador.
                  <br />
                  2. Crie uma pasta chamada <strong>"Proteção de Tela"</strong> e adicione as fotos que você quer ver na tela.
                  <br />
                  3. Depois, clique no botão <strong>"Sincronizar Agora"</strong> acima!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Como funciona o Google Drive com a tela da cozinha:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                Você conecta a sua conta Google com segurança via login oficial.
              </li>
              <li>
                Cria uma pasta com o nome <strong>Proteção de Tela</strong> no seu Google Drive.
              </li>
              <li>
                Quando você ou a Erika tirarem fotos no celular, basta colocar na pasta.
              </li>
              <li>
                O computador LG da cozinha busca as fotos e as exibe no descanso de tela sem precisar de nenhum cabo ou pen drive.
              </li>
            </ul>
          </div>
        )}

        {/* Live Feedback Toast Banner */}
        {syncStatusMsg && (
          <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-amber-300 animate-in fade-in">
            {syncStatusMsg}
          </div>
        )}
      </div>

      {/* Gallery Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Todas as Fotos ({safePhotos.length})
          </button>
          <button
            onClick={() => setActiveFilter("drive")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "drive"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5" />
            <span>Google Drive ({drivePhotosCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter("local")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeFilter === "local"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Locais / Uploads ({safePhotos.length - drivePhotosCount})
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Exibindo {filteredPhotos.length} foto(s)
        </span>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
            <Camera className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-white">Nenhuma foto encontrada neste filtro</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {activeFilter === "drive"
              ? 'Conecte seu Google Drive acima ou adicione fotos na pasta "Proteção de Tela" para sincronizar.'
              : 'Clique em "Adicionar Foto Local" ou sincronize com o seu Google Drive.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg group relative flex flex-col justify-between"
            >
              <div className="h-52 relative overflow-hidden bg-slate-950">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Source Badge */}
                {photo.source === "google_drive" ? (
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <FolderCheck className="w-3 h-3 text-emerald-400" />
                    Google Drive
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Upload Local
                  </span>
                )}

                <button
                  onClick={() => onDeletePhoto(photo.id)}
                  className="absolute top-3 right-3 p-2 bg-slate-950/80 text-slate-400 hover:text-red-400 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                  title="Remover foto da tela"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5">
                <h3 className="font-bold text-white text-sm leading-tight truncate">
                  {photo.title}
                </h3>
                {photo.caption && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {photo.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Add Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">
              Adicionar Nova Foto de Família
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Envie do computador LG/celular ou insira um link para o porta-retrato da casa.
            </p>

            {/* Toggle Upload vs URL */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  uploadMode === "file"
                    ? "bg-rose-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Arquivo do Computador / Celular</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  uploadMode === "url"
                    ? "bg-rose-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Link / URL da Imagem</span>
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Título da Memória *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Passeio no Parque com a Zoe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-rose-500"
                />
              </div>

              {uploadMode === "file" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Selecionar Arquivo de Imagem *
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-rose-500/80 bg-slate-950 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                  >
                    {url ? (
                      <div className="relative group">
                        <img
                          src={url}
                          alt="Prévia"
                          className="h-28 w-auto object-cover rounded-xl border border-slate-700"
                        />
                        <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                          ✓ Foto carregada! Clique para trocar
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-slate-900 rounded-full text-rose-400">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            Clique aqui para escolher a foto
                          </p>
                          <p className="text-[10px] text-slate-500">
                            PNG, JPG, WebP direto do dispositivo
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    URL da Imagem *
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {/* Sample Quick Select */}
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  Ou escolha uma imagem de exemplo:
                </span>
                <div className="flex gap-2 mt-2">
                  {sampleImages.map((s, i) => (
                    <img
                      key={i}
                      src={s}
                      alt="Sample"
                      onClick={() => setUrl(s)}
                      className={`w-14 h-14 object-cover rounded-xl border cursor-pointer transition-all ${
                        url === s
                          ? "border-rose-500 ring-2 ring-rose-500/30"
                          : "border-slate-700 hover:border-slate-500"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Legenda / Frase Carinhosa
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex: Sorriso da Zoe balançando ☀️"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-rose-600/20"
                >
                  Salvar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
