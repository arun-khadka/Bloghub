import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileText,
  Eye,
  Calendar,
  User,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import PropTypes from "prop-types";

/**
 * @typedef {Object} Article
 * @property {string|number} id - Article ID
 * @property {string} title - Article title
 * @property {string} [author_name] - Author name
 * @property {boolean} is_published - Whether article is published
 * @property {number} [view_count] - View count
 * @property {string} [created_at] - Creation date
 * @property {string} [category_name] - Category name
 */

/**
 * @typedef {Object} ArticlesTableProps
 * @property {Article[]} articles - Array of articles to display
 * @property {boolean} loading - Whether data is loading
 * @property {string} [error] - Error message
 * @property {(article: Article) => void} onEdit - Function to handle edit
 * @property {(article: Article) => void} onDelete - Function to handle delete
 * @property {() => void} [onCreate] - Function to handle create
 * @property {number} totalArticles - Total articles count
 */

/**
 * Table component for displaying articles
 * @param {ArticlesTableProps} props
 */
export default function ArticlesTable({
  articles,
  loading,
  error,
  onEdit,
  onDelete,
  onCreate,
  totalArticles,
}) {
  if (loading) {
    return <TableLoadingState />;
  }

  if (error) {
    return null; // Error is handled by AlertBanner
  }

  if (articles.length === 0) {
    return (
      <TableEmptyState totalArticles={totalArticles} onCreate={onCreate} />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead className="text-center">Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Views</TableHead>
            <TableHead className="text-center">Created At</TableHead>
            <TableHead className="text-center w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <ArticleTableRow
              key={article.id}
              article={article}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const TableLoadingState = () => (
  <div className="flex justify-center py-12">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      <p className="text-sm text-gray-600">Loading articles...</p>
    </div>
  </div>
);

const TableEmptyState = ({ totalArticles, onCreate }) => (
  <div className="rounded-md border">
    <Table>
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="py-12 text-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <FileText className="h-12 w-12 opacity-20" />
              <div>
                <p className="font-medium text-gray-900">No articles found</p>
                <p className="text-sm mt-1">
                  {totalArticles === 0
                    ? "Get started by creating your first article."
                    : "Try adjusting your search or filters."}
                </p>
              </div>
              {totalArticles === 0 && onCreate && (
                <Button onClick={onCreate} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Article
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

const ArticleTableRow = ({ article, onEdit, onDelete }) => {
  const getAuthorName = (article) => article?.author_name || "Unknown Author";
  const getCreatedDate = (article) => article.created_at || article.createdAt;
  const getViewsCount = (article) => article.view_count || 0;
  const getStatus = (article) => (article.is_published ? "published" : "draft");

  return (
    <TableRow className="group hover:bg-gray-50/50">
      <TableCell className="py-3">
        <ArticleTitleCell article={article} />
      </TableCell>
      <TableCell className="py-3">
        <AuthorCell authorName={getAuthorName(article)} />
      </TableCell>
      <TableCell className="py-3">
        <StatusBadge status={getStatus(article)} />
      </TableCell>
      <TableCell className="py-3">
        <ViewsCell views={getViewsCount(article)} />
      </TableCell>
      <TableCell className="py-3">
        <DateCell date={getCreatedDate(article)} />
      </TableCell>
      <TableCell className="py-3">
        <ActionButtons
          onEdit={() => onEdit(article)}
          onDelete={() => onDelete(article)}
        />
      </TableCell>
    </TableRow>
  );
};

const ArticleTitleCell = ({ article }) => (
  <div className="flex items-center gap-3 min-w-0">
    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
    <div className="min-w-0 flex-1 max-w-[400px]">
      <span
        className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight block"
        title={article.title}
      >
        {article.title.length > 80
          ? `${article.title.substring(0, 80)}...`
          : article.title}
      </span>
      {article.category_name && (
        <span className="text-xs text-gray-500 mt-1 block">
          {article.category_name}
        </span>
      )}
    </div>
  </div>
);

const AuthorCell = ({ authorName }) => (
  <div className="flex items-center gap-2">
    <User className="h-3 w-3 text-gray-500" />
    <span className="text-sm font-medium text-gray-700">{authorName}</span>
  </div>
);

const StatusBadge = ({ status }) => (
  <Badge
    variant={status === "published" ? "default" : "secondary"}
    className="capitalize text-xs"
  >
    {status}
  </Badge>
);

const ViewsCell = ({ views }) => (
  <div className="flex items-center justify-center gap-2">
    <Eye className="h-3 w-3 text-gray-500" />
    <span className="text-sm font-medium text-gray-900">
      {views.toLocaleString()}
    </span>
  </div>
);

const DateCell = ({ date }) => (
  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
    <Calendar className="h-3 w-3" />
    {new Date(date).toLocaleDateString()}
  </div>
);

const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="flex justify-center gap-1">
    <Button
      size="sm"
      variant="ghost"
      onClick={onEdit}
      className="h-8 w-8 p-0 hover:bg-gray-200"
      title="Edit article"
    >
      <Edit2 className="h-3.5 w-3.5" />
    </Button>
    <Button
      size="sm"
      variant="ghost"
      onClick={onDelete}
      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
      title="Delete article"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  </div>
);

ArticlesTable.propTypes = {
  articles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      author_name: PropTypes.string,
      is_published: PropTypes.bool.isRequired,
      view_count: PropTypes.number,
      created_at: PropTypes.string,
      category_name: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  totalArticles: PropTypes.number.isRequired,
};

ArticlesTable.defaultProps = {
  error: null,
  onCreate: null,
};
