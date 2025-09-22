var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig } from "file:///C:/Users/Samarth/OneDrive/Desktop/sih_final/saferov/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Samarth/OneDrive/Desktop/sih_final/saferov/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Samarth/OneDrive/Desktop/sih_final/saferov/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Samarth\\OneDrive\\Desktop\\sih_final\\saferov";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    define: {
      "import.meta.env.VITE_GOOGLE_MAPS_API_KEY": JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBvOkBwv90yBvOkBwv90yBvOkBwv90yBvOk"),
      "import.meta.env.VITE_WEATHER_API_KEY": JSON.stringify(env.VITE_WEATHER_API_KEY || "your_openweather_api_key_here"),
      "process.env": {}
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: path.resolve(__vite_injected_original_dirname, "./src")
        }
      ]
    },
    optimizeDeps: {
      include: [
        "@googlemaps/js-api-loader",
        "react",
        "react-dom",
        "react-router-dom"
      ]
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      }
    }
  };
});
function loadEnv(mode, root, prefix) {
  const env = {};
  const envFiles = [
    /** default file */
    `.env`,
    /** mode file */
    `.env.${mode}`,
    /** mode local file */
    `.env.${mode}.local`
  ];
  for (const file of envFiles) {
    try {
      const envPath = path.resolve(root, file);
      const fs = __require("fs");
      if (fs.existsSync(envPath)) {
        const envConfig = __require("file:///C:/Users/Samarth/OneDrive/Desktop/sih_final/saferov/node_modules/dotenv/lib/main.js").config({ path: envPath });
        if (envConfig.parsed) {
          for (const [key, value] of Object.entries(envConfig.parsed)) {
            if (key.startsWith(prefix)) {
              env[key] = value;
            }
          }
        }
      }
    } catch (e) {
    }
  }
  return env;
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxTYW1hcnRoXFxcXE9uZURyaXZlXFxcXERlc2t0b3BcXFxcc2loX2ZpbmFsXFxcXHNhZmVyb3ZcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFNhbWFydGhcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxzaWhfZmluYWxcXFxcc2FmZXJvdlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvU2FtYXJ0aC9PbmVEcml2ZS9EZXNrdG9wL3NpaF9maW5hbC9zYWZlcm92L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiBcIjo6XCIsXHJcbiAgICAgIHBvcnQ6IDgwODAsXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9HT09HTEVfTUFQU19BUElfS0VZJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfR09PR0xFX01BUFNfQVBJX0tFWSB8fCAnQUl6YVN5QnZPa0J3djkweUJ2T2tCd3Y5MHlCdk9rQnd2OTB5QnZPaycpLFxyXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfV0VBVEhFUl9BUElfS0VZJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfV0VBVEhFUl9BUElfS0VZIHx8ICd5b3VyX29wZW53ZWF0aGVyX2FwaV9rZXlfaGVyZScpLFxyXG4gICAgICAncHJvY2Vzcy5lbnYnOiB7fVxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaW5kOiBcIkBcIixcclxuICAgICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGluY2x1ZGU6IFtcclxuICAgICAgICAnQGdvb2dsZW1hcHMvanMtYXBpLWxvYWRlcicsXHJcbiAgICAgICAgJ3JlYWN0JyxcclxuICAgICAgICAncmVhY3QtZG9tJyxcclxuICAgICAgICAncmVhY3Qtcm91dGVyLWRvbScsXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XHJcbiAgICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvXSxcclxuICAgICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBsb2FkRW52KG1vZGU6IHN0cmluZywgcm9vdDogc3RyaW5nLCBwcmVmaXg6IHN0cmluZykge1xyXG4gIGNvbnN0IGVudjogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG4gIGNvbnN0IGVudkZpbGVzID0gW1xyXG4gICAgLyoqIGRlZmF1bHQgZmlsZSAqLyBgLmVudmAsXHJcbiAgICAvKiogbW9kZSBmaWxlICovIGAuZW52LiR7bW9kZX1gLFxyXG4gICAgLyoqIG1vZGUgbG9jYWwgZmlsZSAqLyBgLmVudi4ke21vZGV9LmxvY2FsYCxcclxuICBdO1xyXG5cclxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZW52RmlsZXMpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGVudlBhdGggPSBwYXRoLnJlc29sdmUocm9vdCwgZmlsZSk7XHJcbiAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcclxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZW52UGF0aCkpIHtcclxuICAgICAgICBjb25zdCBlbnZDb25maWcgPSByZXF1aXJlKCdkb3RlbnYnKS5jb25maWcoeyBwYXRoOiBlbnZQYXRoIH0pO1xyXG4gICAgICAgIGlmIChlbnZDb25maWcucGFyc2VkKSB7XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhlbnZDb25maWcucGFyc2VkKSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgocHJlZml4KSkge1xyXG4gICAgICAgICAgICAgIGVudltrZXldID0gdmFsdWUgYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIC8vIFNpbGVudGx5IGlnbm9yZSBtaXNzaW5nIGVudiBmaWxlc1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZW52O1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQXlWLFNBQVMsb0JBQW9CO0FBQ3RYLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQUEsSUFDOUUsUUFBUTtBQUFBLE1BQ04sNENBQTRDLEtBQUssVUFBVSxJQUFJLDRCQUE0QiwwQ0FBMEM7QUFBQSxNQUNySSx3Q0FBd0MsS0FBSyxVQUFVLElBQUksd0JBQXdCLCtCQUErQjtBQUFBLE1BQ2xILGVBQWUsQ0FBQztBQUFBLElBQ2xCO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sYUFBYSxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLFFBQzlDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGlCQUFpQjtBQUFBLFFBQ2YsU0FBUyxDQUFDLGNBQWM7QUFBQSxRQUN4Qix5QkFBeUI7QUFBQSxNQUMzQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQztBQUVELFNBQVMsUUFBUSxNQUFjLE1BQWMsUUFBZ0I7QUFDM0QsUUFBTSxNQUE4QixDQUFDO0FBQ3JDLFFBQU0sV0FBVztBQUFBO0FBQUEsSUFDSztBQUFBO0FBQUEsSUFDSCxRQUFRLElBQUk7QUFBQTtBQUFBLElBQ04sUUFBUSxJQUFJO0FBQUEsRUFDckM7QUFFQSxhQUFXLFFBQVEsVUFBVTtBQUMzQixRQUFJO0FBQ0YsWUFBTSxVQUFVLEtBQUssUUFBUSxNQUFNLElBQUk7QUFDdkMsWUFBTSxLQUFLLFVBQVEsSUFBSTtBQUN2QixVQUFJLEdBQUcsV0FBVyxPQUFPLEdBQUc7QUFDMUIsY0FBTSxZQUFZLFVBQVEsNkZBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDNUQsWUFBSSxVQUFVLFFBQVE7QUFDcEIscUJBQVcsQ0FBQyxLQUFLLEtBQUssS0FBSyxPQUFPLFFBQVEsVUFBVSxNQUFNLEdBQUc7QUFDM0QsZ0JBQUksSUFBSSxXQUFXLE1BQU0sR0FBRztBQUMxQixrQkFBSSxHQUFHLElBQUk7QUFBQSxZQUNiO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixTQUFTLEdBQUc7QUFBQSxJQUVaO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFtdCn0K
