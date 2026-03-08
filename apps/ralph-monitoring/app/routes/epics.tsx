import { Outlet, useNavigation } from 'react-router';

export default function EpicsLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <>
      {isLoading && (
        <div
          className="fixed left-0 right-0 top-0 z-40 h-0.5 bg-primary/20"
          aria-hidden
        >
          <div className="h-full w-1/3 animate-pulse rounded-r-full bg-primary" />
        </div>
      )}
      <Outlet />
    </>
  );
}
