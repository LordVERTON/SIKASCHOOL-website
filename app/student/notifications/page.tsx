import Link from "next/link";

export default function StudentNotifications() {
  const notifications = [
    {
      id: "1",
      type: "assignment",
      title: "Nouveau devoir disponible",
      body: "Un nouveau devoir de mathématiques a été publié. Date limite: 15 septembre.",
      read: false,
      createdAt: "2024-09-14T10:30:00Z",
      actionUrl: "/student/assignments"
    },
    {
      id: "2",
      type: "message",
      title: "Nouveau message de M. Dupont",
      body: "Votre tuteur a répondu à votre question sur les dérivées.",
      read: false,
      createdAt: "2024-09-14T14:30:00Z",
      actionUrl: "/student/messages"
    },
    {
      id: "3",
      type: "grade",
      title: "Devoir corrigé",
      body: "Votre devoir de français a été corrigé. Note: 16/20",
      read: true,
      createdAt: "2024-09-13T16:45:00Z",
      actionUrl: "/student/assignments"
    },
    {
      id: "4",
      type: "reminder",
      title: "Rappel: Séance demain",
      body: "N'oubliez pas votre séance de physique avec Mme Martin demain à 16h.",
      read: true,
      createdAt: "2024-09-13T09:00:00Z",
      actionUrl: "/student/calendar"
    },
    {
      id: "5",
      type: "course",
      title: "Nouvelle leçon disponible",
      body: "Une nouvelle leçon de mathématiques est maintenant disponible.",
      read: true,
      createdAt: "2024-09-12T11:20:00Z",
      actionUrl: "/student/courses"
    },
    {
      id: "6",
      type: "system",
      title: "Maintenance programmée",
      body: "Une maintenance est prévue dimanche de 2h à 4h du matin.",
      read: true,
      createdAt: "2024-09-11T15:00:00Z",
      actionUrl: null
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-orange-500">
            <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5h3Z"/>
            <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12Z"/>
          </svg>
        );
      case 'message':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-blue-500">
            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        );
      case 'grade':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-green-500">
            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"/>
            <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"/>
          </svg>
        );
      case 'reminder':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-purple-500">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
          </svg>
        );
      case 'course':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-indigo-500">
            <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
          </svg>
        );
      case 'system':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-500">
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.292-.159a1.873 1.873 0 0 0-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.292A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-500">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'assignment': return 'Devoir';
      case 'message': return 'Message';
      case 'grade': return 'Note';
      case 'reminder': return 'Rappel';
      case 'course': return 'Cours';
      case 'system': return 'Système';
      default: return 'Autre';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                Notifications
              </h1>
              <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
                Consultez vos notifications et alertes.
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark">
                Marquer tout comme lu
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid gap-7.5 md:grid-cols-3">
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Total</div>
            <div className="text-2xl font-semibold text-black dark:text-white">{notifications.length}</div>
          </div>
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Non lues</div>
            <div className="text-2xl font-semibold text-primary">{unreadCount}</div>
          </div>
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Aujourd'hui</div>
            <div className="text-2xl font-semibold text-green-600">
              {notifications.filter(n => {
                const date = new Date(n.createdAt);
                const today = new Date();
                return date.toDateString() === today.toDateString();
              }).length}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <div className="p-6 border-b border-stroke dark:border-strokedark">
            <h2 className="text-lg font-semibold text-black dark:text-white">Toutes les notifications</h2>
          </div>
          
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm font-medium ${
                        !notification.read ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {getTypeLabel(notification.type)}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 ${
                      !notification.read ? 'text-black dark:text-white' : 'text-waterloo dark:text-manatee'
                    }`}>
                      {notification.body}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-waterloo dark:text-manatee">
                        {formatDate(notification.createdAt)}
                      </p>
                      
                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl}
                          className="text-xs text-primary hover:underline"
                        >
                          Voir →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state for read notifications */}
        {notifications.filter(n => n.read).length > 0 && (
          <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                Notifications lues
              </h3>
              <p className="text-waterloo dark:text-manatee mb-4">
                Vous avez {notifications.filter(n => n.read).length} notifications lues.
              </p>
              <button className="text-primary hover:underline">
                Archiver les notifications lues
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
