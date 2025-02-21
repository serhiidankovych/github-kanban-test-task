import React from "react";
import { Card, Typography } from "antd";
import { Issue } from "../types/types";

const { Text } = Typography;

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const daysOpen = Math.floor(
    (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card title={issue.title}>
      <Text type="secondary">
        #{issue.number} opened {daysOpen} days ago
      </Text>
      <br />
      <Text type="secondary">
        {issue.user.login} | Comments: {issue.comments}
      </Text>
    </Card>
  );
};

export default IssueCard;
