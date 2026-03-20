import { Button, Result } from 'antd';

interface AppErrorResultProps {
  title?: string;
  subtitle: string;
  onRetry?: () => void;
}

export default function AppErrorResult({ title = 'Something went wrong', subtitle, onRetry }: AppErrorResultProps) {
  return (
    <Result
      status="error"
      title={title}
      subTitle={subtitle}
      extra={onRetry ? <Button onClick={onRetry}>Retry</Button> : undefined}
    />
  );
}
