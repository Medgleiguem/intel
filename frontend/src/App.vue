<template>
  <div id="app" :class="{ rtl: isRTL }">
    <header class="bg-blue-600 text-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold flex items-center">
            <span class="mr-2">🤖</span>
            Moussadar
          </h1>
          <div class="flex items-center space-x-4">
            <!-- Connection status -->
            <div class="flex items-center">
              <div
                :class="[
                  'w-3 h-3 rounded-full mr-2',
                  isOnline ? 'bg-green-400' : 'bg-red-400',
                ]"
              ></div>
              <span class="text-sm">{{
                isOnline ? $t("online") : $t("offline")
              }}</span>
            </div>

            <!-- Language switcher -->
            <button
              @click="toggleLanguage"
              class="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded transition-colors"
            >
              {{ currentLanguage === "fr" ? "العربية" : "Français" }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>

    <!-- Offline indicator -->
    <div
      v-if="!isOnline"
      class="fixed bottom-4 left-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg"
    >
      {{ $t("offlineMode") }}
    </div>

    <!-- Install prompt -->
    <div
      v-if="showInstallPrompt"
      class="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg"
    >
      <p class="mb-2">{{ $t("installApp") }}</p>
      <div class="flex space-x-2">
        <button
          @click="installApp"
          class="px-4 py-2 bg-green-500 hover:bg-green-400 rounded"
        >
          {{ $t("install") }}
        </button>
        <button
          @click="dismissInstall"
          class="px-4 py-2 bg-gray-500 hover:bg-gray-400 rounded"
        >
          {{ $t("later") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "./stores/app";

export default {
  name: "App",
  setup() {
    const { locale, t } = useI18n();
    const appStore = useAppStore();

    const isOnline = ref(navigator.onLine);
    const showInstallPrompt = ref(false);
    const deferredPrompt = ref(null);

    const currentLanguage = computed(() => locale.value);
    const isRTL = computed(() => locale.value === "ar");

    // Language switching
    const toggleLanguage = () => {
      const newLang = locale.value === "fr" ? "ar" : "fr";
      locale.value = newLang;
      document.documentElement.setAttribute("lang", newLang);
      document.documentElement.setAttribute(
        "dir",
        newLang === "ar" ? "rtl" : "ltr"
      );
      appStore.setLanguage(newLang);
    };

    // Connection status
    const updateConnectionStatus = () => {
      isOnline.value = navigator.onLine;
    };

    // Install prompt handling
    const installApp = async () => {
      if (deferredPrompt.value) {
        deferredPrompt.value.prompt();
        const { outcome } = await deferredPrompt.value.userChoice;
        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
        }
        deferredPrompt.value = null;
        showInstallPrompt.value = false;
      }
    };

    const dismissInstall = () => {
      showInstallPrompt.value = false;
      deferredPrompt.value = null;
    };

    onMounted(() => {
      // Set initial language
      document.documentElement.setAttribute("lang", locale.value);
      document.documentElement.setAttribute("dir", isRTL.value ? "rtl" : "ltr");

      // Listen for connection changes
      window.addEventListener("online", updateConnectionStatus);
      window.addEventListener("offline", updateConnectionStatus);

      // Listen for install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt.value = e;
        showInstallPrompt.value = true;
      });
    });

    return {
      isOnline,
      currentLanguage,
      isRTL,
      showInstallPrompt,
      toggleLanguage,
      installApp,
      dismissInstall,
      t,
    };
  },
};
</script>

<style>
@import "./style.css";

#app {
  min-height: 100vh;
  background-color: #f8fafc;
}

.rtl {
  direction: rtl;
  text-align: right;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
