<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import PerformanceChart from './components/PerformanceMetrics.vue';

const createClickEffect = (event) => {
  const circle = document.createElement('div');
  circle.classList.add('click-effect');
  
  circle.style.left = event.clientX + 'px';
  circle.style.top = event.clientY + 'px';
  
  document.body.appendChild(circle);
  
  circle.addEventListener('animationend', () => {
    circle.remove();
  });
};

onMounted(() => {
  document.addEventListener('click', createClickEffect);
});

onUnmounted(() => {
  document.removeEventListener('click', createClickEffect);
});

const intervals = ref({});

const scripts = ref([
  {
    id: 1,
    name: 'Email Script',
    description: 'Sends emails to all AD users',
    status: 'stopped',
    interval: 0,
    metrics: {
      requests: 0,
      avgResponseTime: 0
    },
    timeSeriesData: {
      labels: [],
      requests: [],
      responseTimes: []
    }
  },
  {
    id: 2,
    name: 'DNS Query Script',
    description: 'Performs DNS queries',
    status: 'stopped',
    interval: 0,
    metrics: {
      requests: 0,
      avgResponseTime: 0
    },
    timeSeriesData: {
      labels: [],
      requests: [],
      responseTimes: []
    }
  },
  {
    id: 3,
    name: 'Web Navigation Script',
    description: 'Simulates web app navigation',
    status: 'stopped',
    interval: 0,
    metrics: {
      requests: 0,
      avgResponseTime: 0
    },
    timeSeriesData: {
      labels: [],
      requests: [],
      responseTimes: []
    }
  }
]);

const createChartData = (labels, data, label, color) => ({
  labels,
  datasets: [
    {
      label,
      backgroundColor: color,
      borderColor: color,
      data,
      tension: 0.4
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 750
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(147, 51, 234, 0.1)'
      },
      ticks: {
        color: '#9333EA'
      }
    },
    x: {
      grid: {
        color: 'rgba(147, 51, 234, 0.1)'
      },
      ticks: {
        color: '#9333EA'
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: '#9333EA'
      }
    }
  }
};

const startInterval = (script) => {
  if (intervals.value[script.id]) {
    clearInterval(intervals.value[script.id]);
  }

  return setInterval(() => {
    const timestamp = new Date().toLocaleTimeString();
    const newRequests = Math.floor(Math.random() * 10);
    const newResponseTime = Math.random() * 100;

    script.metrics = {
      ...script.metrics,
      requests: script.metrics.requests + newRequests,
      avgResponseTime: newResponseTime
    };

    script.timeSeriesData = {
      labels: [...script.timeSeriesData.labels, timestamp],
      requests: [...script.timeSeriesData.requests, newRequests],
      responseTimes: [...script.timeSeriesData.responseTimes, newResponseTime]
    };

    if (script.timeSeriesData.labels.length > 10) {
      script.timeSeriesData.labels = script.timeSeriesData.labels.slice(-10);
      script.timeSeriesData.requests = script.timeSeriesData.requests.slice(-10);
      script.timeSeriesData.responseTimes = script.timeSeriesData.responseTimes.slice(-10);
    }
  }, script.interval > 0 ? script.interval * 60 * 1000 : 2000);
};

const toggleScript = (scriptId) => {
  const script = scripts.value.find((s) => s.id === scriptId);
  if (!script) return;

  if (script.status === 'running') {
    if (intervals.value[scriptId]) {
      clearInterval(intervals.value[scriptId]);
      delete intervals.value[scriptId];
    }
    script.status = 'stopped';
  } else {
    script.status = 'running';
    intervals.value[scriptId] = startInterval(script);
  }
};

const deleteScript = (scriptId) => {
  if (intervals.value[scriptId]) {
    clearInterval(intervals.value[scriptId]);
    delete intervals.value[scriptId];
  }
  scripts.value = scripts.value.filter((s) => s.id !== scriptId);
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const newScript = {
      id: Date.now(),
      name: file.name,
      description: 'Custom uploaded script',
      status: 'stopped',
      interval: 0,
      metrics: {
        requests: 0,
        avgResponseTime: 0
      },
      timeSeriesData: {
        labels: [],
        requests: [],
        responseTimes: []
      }
    };
    scripts.value.push(newScript);
    event.target.value = '';
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 px-4 py-8">
    <div class="container mx-auto">
      <h1 class="text-4xl font-bold text-purple-600 mb-8 transform hover:scale-105 transition-transform">
        SPRC Traffic Simulation Management
      </h1>

      <!-- Script Upload Section -->
      <div class="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl backdrop-blur-sm shadow-lg transform hover:scale-101 transition-all">
        <h2 class="text-xl font-semibold mb-4 text-purple-800">Upload New Script</h2>
        <input 
          type="file" 
          @change="handleFileUpload"
          class="block w-full text-sm text-purple-700
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-600 file:text-white
            hover:file:bg-purple-700
            transition-all duration-300"
        />
      </div>

      <!-- Scripts Management Section -->
      <div class="grid gap-6">
        <div v-for="script in scripts" :key="script.id"
             class="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200 
                    transform hover:scale-[1.01] transition-all duration-300">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-purple-800">{{ script.name }}</h3>
              <p class="text-purple-600">{{ script.description }}</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="toggleScript(script.id)"
                :class="`px-4 py-2 rounded-lg ${
                  script.status === 'running' 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-teal-500 hover:bg-teal-600'
                } text-white transform hover:scale-105 transition-all duration-300 shadow-md`"
              >
                {{ script.status === 'running' ? 'Stop' : 'Start' }}
              </button>
              <button 
                @click="deleteScript(script.id)"
                class="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white
                       transform hover:scale-105 transition-all duration-300 shadow-md"
              >
                Delete
              </button>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-purple-700 mb-2">
              Run Interval (minutes)
            </label>
            <input 
              type="number" 
              v-model="script.interval"
              class="mt-1 block w-full rounded-lg border-purple-300 
                     shadow-sm focus:border-purple-500 focus:ring-purple-500
                     bg-purple-50/50 transition-all duration-300"
              min="0"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300">
              <p class="text-sm text-purple-600">Requests Sent</p>
              <p class="text-2xl font-semibold text-purple-800">{{ script.metrics.requests }}</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300">
              <p class="text-sm text-purple-600">Avg Response Time</p>
              <p class="text-2xl font-semibold text-purple-800">{{ script.metrics.avgResponseTime.toFixed(2) }}ms</p>
            </div>
          </div>

          <div v-if="script.timeSeriesData.labels.length > 0" 
               class="mt-4 transform transition-all duration-500"
               :class="{'opacity-100 translate-y-0': script.timeSeriesData.labels.length > 0, 
                        'opacity-0 translate-y-4': script.timeSeriesData.labels.length === 0}">
            <h4 class="text-lg font-semibold mb-4 text-purple-800">Performance Metrics</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="h-[300px] p-4 bg-white/90 rounded-lg shadow-lg">
                <h5 class="text-sm font-medium mb-2 text-purple-700">Requests per Minute</h5>
                <PerformanceChart
                  :chart-data="createChartData(
                    script.timeSeriesData.labels,
                    script.timeSeriesData.requests,
                    'Requests',
                    '#0D9488'
                  )"
                  :chart-options="chartOptions"
                />
              </div>
              
              <div class="h-[300px] p-4 bg-white/90 rounded-lg shadow-lg">
                <h5 class="text-sm font-medium mb-2 text-purple-700">Average Response Time (ms)</h5>
                <PerformanceChart
                  :chart-data="createChartData(
                    script.timeSeriesData.labels,
                    script.timeSeriesData.responseTimes,
                    'Response Time',
                    '#F97316'
                  )"
                  :chart-options="chartOptions"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.scale-101 {
  transform: scale(1.01);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fade-in-up 0.5s ease-out;
}

/* Global click effect */
.click-effect {
  position: fixed;
  pointer-events: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(147, 51, 234, 0.3);
  transform: translate(-50%, -50%);
  animation: click-animation 0.5s ease-out forwards;
}

@keyframes click-animation {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

input[type="number"] {
  @apply px-3 py-2;
}

button {
  position: relative;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
}

button:active {
  transform: scale(0.95);
  transition: 0.1s;
}
</style>