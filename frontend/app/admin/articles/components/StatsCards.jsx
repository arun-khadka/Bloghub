import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import PropTypes from "prop-types";

/**
 * @typedef {Object} StatsData
 * @property {number} [total] - Total articles
 * @property {number} [published] - Published articles count
 * @property {number} [draft] - Draft articles count
 * @property {number} [total_views] - Total views count
 */

/**
 * @typedef {Object} StatsCardsProps
 * @property {StatsData} [stats] - Statistics data
 * @property {boolean} loading - Whether data is loading
 */

const StatItem = ({ label, value, color, loading }) => {
  if (loading) {
    return (
      <Card className="border">
        <CardHeader className="pb-2">
          <CardDescription>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </CardDescription>
          <CardTitle className="text-2xl">
            <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <CardDescription className="font-medium">{label}</CardDescription>
        <CardTitle className={`text-2xl ${color}`}>
          {(value || 0).toLocaleString()}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

/**
 * Display statistics cards for articles
 * @param {StatsCardsProps} props
 */
export default function StatsCards({ stats, loading }) {
  const statItems = [
    {
      key: "total",
      label: "Total Articles",
      value: stats?.total,
      color: "text-gray-900",
    },
    {
      key: "published",
      label: "Published",
      value: stats?.published,
      color: "text-green-600",
    },
    {
      key: "draft",
      label: "Drafts",
      value: stats?.draft,
      color: "text-amber-600",
    },
    {
      key: "total_views",
      label: "Total Views",
      value: stats?.total_views,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statItems.map((item) => (
        <StatItem
          key={item.key}
          label={item.label}
          value={item.value}
          color={item.color}
          loading={loading}
        />
      ))}
    </div>
  );
}

StatsCards.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    published: PropTypes.number,
    draft: PropTypes.number,
    total_views: PropTypes.number,
  }),
  loading: PropTypes.bool.isRequired,
};

StatsCards.defaultProps = {
  stats: null,
  loading: false,
};
