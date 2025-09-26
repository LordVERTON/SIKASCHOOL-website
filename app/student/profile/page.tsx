import Link from "next/link";

export default function StudentProfile() {
  const user = {
    name: "Marie Dupont",
    email: "marie.dupont@email.com",
    avatar: "/images/user/user-01.png",
    level: "Terminale",
    joinDate: "2024-01-15",
    timezone: "Europe/Paris",
    language: "fr",
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  };

  const preferences = [
    {
      id: "language",
      label: "Langue",
      value: "Français",
      options: ["Français", "English"]
    },
    {
      id: "timezone", 
      label: "Fuseau horaire",
      value: "Europe/Paris",
      options: ["Europe/Paris", "Europe/London", "America/New_York"]
    },
    {
      id: "theme",
      label: "Thème",
      value: "Système",
      options: ["Clair", "Sombre", "Système"]
    }
  ];

  const notificationSettings = [
    {
      id: "email",
      label: "Notifications par email",
      description: "Recevoir des notifications par email",
      enabled: user.notifications.email
    },
    {
      id: "push",
      label: "Notifications push",
      description: "Recevoir des notifications dans le navigateur",
      enabled: user.notifications.push
    },
    {
      id: "sms",
      label: "Notifications SMS",
      description: "Recevoir des notifications par SMS",
      enabled: user.notifications.sms
    }
  ];

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Mon profil
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Gérez vos préférences et informations personnelles.
          </p>
        </div>

        <div className="mt-10 grid gap-7.5 lg:grid-cols-3">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="text-center">
                {/* Avatar */}
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {user.name}
                </h2>
                <p className="text-waterloo dark:text-manatee mb-4">
                  {user.email}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-waterloo dark:text-manatee">Niveau:</span>
                    <span className="text-black dark:text-white">{user.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-waterloo dark:text-manatee">Membre depuis:</span>
                    <span className="text-black dark:text-white">
                      {new Date(user.joinDate).toLocaleDateString('fr-FR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                <button className="mt-6 w-full rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark">
                  Modifier le profil
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                  Informations personnelles
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Niveau scolaire
                    </label>
                    <select className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection">
                      <option value="3eme">3ème</option>
                      <option value="2nde">2nde</option>
                      <option value="1ere">1ère</option>
                      <option value="terminale" selected>Terminale</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="rounded-md bg-primary px-6 py-2 font-medium text-white transition hover:opacity-90">
                    Sauvegarder
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                  Préférences
                </h3>
                
                <div className="space-y-4">
                  {preferences.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-black dark:text-white">
                          {pref.label}
                        </label>
                        <p className="text-xs text-waterloo dark:text-manatee">
                          Valeur actuelle: {pref.value}
                        </p>
                      </div>
                      <select className="p-2 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection">
                        {pref.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                  Notifications
                </h3>
                
                <div className="space-y-4">
                  {notificationSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-black dark:text-white">
                          {setting.label}
                        </label>
                        <p className="text-xs text-waterloo dark:text-manatee">
                          {setting.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={setting.enabled}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                  Sécurité
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">
                        Mot de passe
                      </label>
                      <p className="text-xs text-waterloo dark:text-manatee">
                        Dernière modification il y a 3 mois
                      </p>
                    </div>
                    <button className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark">
                      Modifier
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">
                        Authentification à deux facteurs
                      </label>
                      <p className="text-xs text-waterloo dark:text-manatee">
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                    </div>
                    <button className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark">
                      Activer
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="animate_top rounded-lg border border-red-200 bg-red-50 p-7.5 dark:border-red-800 dark:bg-red-900/20">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
                  Zone de danger
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-red-800 dark:text-red-200">
                        Supprimer le compte
                      </label>
                      <p className="text-xs text-red-600 dark:text-red-300">
                        Cette action est irréversible
                      </p>
                    </div>
                    <button className="rounded-md border border-red-300 px-4 py-2 text-red-600 transition hover:opacity-90 dark:border-red-700 dark:text-red-400">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
