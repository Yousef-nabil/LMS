import { useEffect, useState } from "react";
import { motion, Reorder } from "motion/react";
import { useParams, Link } from "react-router";
import { 
  Plus, 
  Video, 
  FileText, 
  GripVertical, 
  Trash2, 
  ChevronLeft, 
  Loader2,
  CheckCircle,
  Play,
  HelpCircle,
  ClipboardList
} from "lucide-react";
import { courseService } from "../../api/services/courseService";
import { ConfirmModal } from "../../components/ConfirmModal";

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  file_url?: string;
  thumbnail_url?: string;
  position: string;
}

export function ManageCourse() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<'video' | 'document' | 'quiz' | 'assignment'>('video');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("Uploading...");
  const [isUploading, setIsUploading] = useState(false);
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [courseData, contentData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getCourseContent(id)
        ]);
        setCourse(courseData);
        // Sort contents by position string (fractional indexing)
        const sorted = (contentData as ContentItem[]).sort((a, b) => 
          (a.position || "").localeCompare(b.position || "")
        );
        setContents(sorted);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddContent = async () => {
    if (!id || !newTitle || !selectedFile) return;
    
    let progressInterval: any;
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    // Estimate cloud processing time: ~1 second per 5MB + 1s base
    const estimatedCloudSeconds = Math.max(2, Math.ceil(fileSizeMB / 5));
    const crawlStepMs = (estimatedCloudSeconds * 1000) / 10; // Divide total time into 10 steps (90% to 99%)
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Uploading to server...");

    try {
      const result = await courseService.createContent(
        id, 
        {
          title: newTitle,
          type: newType,
          file: selectedFile,
          thumbnail: selectedThumbnail,
        },
        (progress) => {
          if (progress === 100) {
            setUploadStatus(`Processing ${fileSizeMB.toFixed(1)}MB on cloud...`);
            setUploadProgress(90);
            
            // Start a smooth crawl based on estimated file size
            progressInterval = setInterval(() => {
              setUploadProgress(prev => {
                if (prev >= 99) {
                  clearInterval(progressInterval);
                  return 99;
                }
                return prev + 1;
              });
            }, crawlStepMs);
          } else {
            setUploadProgress(Math.round(progress * 0.9));
          }
        }
      );

      clearInterval(progressInterval!);
      setUploadProgress(100);
      setUploadStatus("Success! Material secured.");
      
      // Short delay before closing the form
      setTimeout(() => {
        setContents([...contents, result]);
        setNewTitle("");
        setSelectedFile(null);
        setSelectedThumbnail(null);
        setIsAdding(false);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval!);
      console.error("Failed to add content", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!id || !deleteContentId) return;
    setIsDeleting(true);
    try {
      await courseService.deleteContent(id, deleteContentId);
      setContents(contents.filter(item => item.id !== deleteContentId));
      setDeleteContentId(null);
    } catch (err) {
      console.error("Failed to delete content", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (newOrder: ContentItem[]) => {
    // Find what changed
    const movedItemIdx = newOrder.findIndex((item, i) => item.id !== contents[i]?.id);
    
    // Optimistic update
    setContents(newOrder);

    if (movedItemIdx !== -1) {
      try {
        const movedItem = newOrder[movedItemIdx];
        const prevItem = newOrder[movedItemIdx - 1] || null;
        const nextItem = newOrder[movedItemIdx + 1] || null;
        
        await courseService.reorderContent(
          id!, 
          movedItem.id, 
          prevItem?.id || null, 
          nextItem?.id || null
        );
        
        // Refresh to get updated position strings from backend
        const contentData = await courseService.getCourseContent(id!);
        const sorted = (contentData as ContentItem[]).sort((a, b) => 
          (a.position || "").localeCompare(b.position || "")
        );
        setContents(sorted);
      } catch (err) {
        console.error("Failed to persist new order", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/instructor/my-courses" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{course?.title}</h1>
          <p className="text-muted-foreground text-sm">Curriculum Builder & Content Management</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Builder Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="size-5 text-primary" />
              Course Curriculum
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-lg shadow-primary/20"
            >
              <Plus className="size-4" />
              Add New Lesson
            </motion.button>
          </div>

          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-card border border-primary/30 rounded-2xl shadow-xl space-y-4"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Lesson Title (e.g., Introduction to React)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setNewType('video')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-2 rounded-xl border transition-all text-sm ${newType === 'video' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-transparent border-border text-muted-foreground'}`}
                  >
                    <Video className="size-4" /> Video
                  </button>
                  <button
                    onClick={() => setNewType('document')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-2 rounded-xl border transition-all text-sm ${newType === 'document' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-transparent border-border text-muted-foreground'}`}
                  >
                    <FileText className="size-4" /> Document
                  </button>
                  <button
                    onClick={() => setNewType('quiz')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-2 rounded-xl border transition-all text-sm ${newType === 'quiz' ? 'bg-purple-500/10 border-purple-500 text-purple-500' : 'bg-transparent border-border text-muted-foreground'}`}
                  >
                    <HelpCircle className="size-4" /> Quiz
                  </button>
                  <button
                    onClick={() => setNewType('assignment')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-2 rounded-xl border transition-all text-sm ${newType === 'assignment' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-transparent border-border text-muted-foreground'}`}
                  >
                    <ClipboardList className="size-4" /> Assignment
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept={newType === 'video' ? "video/*" : newType === 'document' ? ".pdf,.doc,.docx,.txt" : "*/*"}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <div className="text-sm font-medium text-foreground">
                      {selectedFile ? selectedFile.name : `Select ${newType} file`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Drag and drop or click to browse'}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedThumbnail(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <div className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors ${selectedThumbnail ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <div className="text-xs font-medium text-foreground flex items-center justify-center gap-2">
                      <Play className="size-3" />
                      {selectedThumbnail ? selectedThumbnail.name : 'Add Lesson Thumbnail (Optional)'}
                    </div>
                  </div>
                </div>

                {selectedFile && selectedFile.size > 1024 * 1024 * 1024 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium flex items-center gap-2">
                    <Trash2 className="size-4" />
                    File is too large! Maximum allowed size is 1GB.
                  </div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-primary animate-pulse">{uploadStatus}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddContent}
                  disabled={!newTitle || !selectedFile || isUploading || (selectedFile && selectedFile.size > 1024 * 1024 * 1024)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  {isUploading ? 'Uploading...' : 'Create Lesson'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Sortable List */}
          <div className="space-y-3">
            {contents.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <div className="bg-primary/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="size-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Your curriculum is empty</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm mt-1">Start by adding your first lesson or video module.</p>
              </div>
            ) : (
              <Reorder.Group axis="y" values={contents} onReorder={handleReorder} className="space-y-3">
                {contents.map((item) => (
                  <Reorder.Item 
                    key={item.id} 
                    value={item}
                    className="group flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md"
                  >
                    <div className="text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="size-5" />
                    </div>
                    <div className={`size-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ${
                      item.type === 'video' ? 'bg-blue-500/10 text-blue-500' : 
                      item.type === 'document' ? 'bg-orange-500/10 text-orange-500' :
                      item.type === 'quiz' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        item.type === 'video' ? <Video className="size-6" /> : 
                        item.type === 'document' ? <FileText className="size-6" /> :
                        item.type === 'quiz' ? <HelpCircle className="size-6" /> :
                        <ClipboardList className="size-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.type}</p>
                        {item.file_url && (
                          <a 
                            href={item.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline font-bold"
                          >
                            VIEW FILE
                          </a>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteContentId(item.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>
        </div>

        {/* Sidebar Info/Tips */}
        <div className="space-y-6">
          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Plus className="size-4" />
              Quick Tips
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <div className="size-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                Drag and drop items to reorder them in the curriculum.
              </li>
              <li className="flex gap-2">
                <div className="size-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                Mix videos and documents to keep students engaged.
              </li>
              <li className="flex gap-2">
                <div className="size-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                Changes are saved automatically when you reorder.
              </li>
            </ul>
          </div>

          <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Course Status</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Lessons</span>
              <span className="font-medium">{contents.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Duration</span>
              <span className="font-medium">-- mins</span>
            </div>
            <div className="pt-2">
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-success w-full h-full" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">Published & Live</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteContentId}
        onClose={() => setDeleteContentId(null)}
        onConfirm={handleDeleteContent}
        isLoading={isDeleting}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? All associated files and data will be removed permanently."
      />
    </div>
  );
}
