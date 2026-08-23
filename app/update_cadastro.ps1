$content = Get-Content -Path "C:/Users/salat/Projeto-Quitanda/App-Quitanda.com/app/cadastro.tsx" -Raw

$oldSave = @"
      setLoading(true);
      try {
        await api.put('/usuarios/me/endereco', {
          cep, rua, numero, bairro, cidade, estado,
          latitude: 0, longitude: 0
        });
"@

$newSave = @"
      setLoading(true);
      try {
        let latitude = 0;
        let longitude = 0;
        try {
          const query = encodeURIComponent(`$rua, $numero, $cidade, $estado, Brasil`);
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            latitude = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
          } else {
            const queryFallback = encodeURIComponent(`$rua, $cidade, $estado, Brasil`);
            const geoResFb = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${queryFallback}`);
            const geoDataFb = await geoResFb.json();
            if (geoDataFb && geoDataFb.length > 0) {
              latitude = parseFloat(geoDataFb[0].lat);
              longitude = parseFloat(geoDataFb[0].lon);
            }
          }
        } catch (e) {
          console.log("Erro ao buscar coordenadas", e);
        }

        await api.put('/usuarios/me/endereco', {
          cep, rua, numero, bairro, cidade, estado,
          latitude, longitude
        });
"@

$content = $content.Replace($oldSave, $newSave)
Set-Content -Path "C:/Users/salat/Projeto-Quitanda/App-Quitanda.com/app/cadastro.tsx" -Value $content -Encoding UTF8
