import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      tailwindcss(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '',
        },
        less: {
          javascriptEnabled: true,
          modifyVars: {}
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@router': resolve(__dirname, 'src/router'),
      },
    },
    server: {
      port: 81,
      // 配置开发服务器支持SPA路由
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          ws: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径
        },
      },
    },
    // 配置开发服务器的SPA回退
    preview: {
      port: 81,
    },
  };
});
