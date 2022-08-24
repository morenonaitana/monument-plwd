import { NotificationBadge } from '@components';
import { ProfileAvatar } from '@components/avatar';
import Head from 'next/head';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useAppUserContext } from 'src/hooks/useAppUserContext';
import { usePermissions } from 'src/hooks/usePermissions';

interface IHeader {
  isPublic?: boolean;
  tabTitle?: string;
}

export const Header: React.FC<IHeader> = ({ tabTitle, isPublic }) => {
  const { t } = useTranslation('common');
  const { user, plwd, hasAccessToMultipleCarecircles } = useAppUserContext();
  const { canAccessCarecircle, canAccessCalendar, canManageCarecircle } =
    usePermissions();

  const basePath = `/plwd/${plwd.id}`;

  return (
    <div className="navbar bg-base-100 p-0 mx-0 mt-4 mb-4">
      <Head>
        <title>{tabTitle || 'Monument'}</title>
      </Head>
      {isPublic ? (
        <Link href="/">
          <div className="btn btn-ghost normal-case text-xl p-0">Monument</div>
        </Link>
      ) : (
        <>
          <div className="flex-1">
            <Link href={basePath}>
              <div className="btn btn-ghost normal-case text-xl p-0">
                Monument
              </div>
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal p-0">
              <li>
                <Link href={basePath}>{t('home')}</Link>
              </li>
              <li>
                <Link href={`${basePath}/location`}>{t('location')}</Link>
              </li>
              {canAccessCalendar ? (
                <li>
                  <Link href={`${basePath}/calendar`}>{t('calendar')}</Link>
                </li>
              ) : null}
              {canAccessCarecircle ? (
                <li>
                  <Link href={`${basePath}/carecircle`}>{t('carecircle')}</Link>
                </li>
              ) : null}
              <li>
                <Link href={`${basePath}/simulation`}>{t('simulation')}</Link>
              </li>
              <li>
                <Link href={`${basePath}/help`}>{t('help')}</Link>
              </li>
            </ul>
            <NotificationBadge />
            <div className="dropdown dropdown-end ml-2">
              <ProfileAvatar
                firstName={user.firstName}
                lastName={user.lastName}
                picture={user.picture}
              />
              <ul
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
                tabIndex={0}
              >
                <li>
                  <Link href={`${basePath}/profile`}>
                    <div className="justify-between">Profile</div>
                  </Link>
                </li>
                {canManageCarecircle ? (
                  <li>
                    <Link href={`${basePath}/plwd`}>
                      <div className="justify-between">PLWD Info</div>
                    </Link>
                  </li>
                ) : null}
                {hasAccessToMultipleCarecircles ? (
                  <li>
                    <Link href="/switch">
                      <div className="justify-between">Switch carecircle</div>
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href={'/api/auth/logout'}>{t('logoutButton')}</Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
