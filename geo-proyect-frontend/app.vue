<template>
  <div class="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Global header -->
    <Header />

    <!-- Page layout: grow to take available space -->
    <main class="flex-1">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>

    <!-- Global footer -->
    <Footer />
  </div>
</template>