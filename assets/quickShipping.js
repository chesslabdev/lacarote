/*
  Quick JS by Jason @ freakdesign.
  Adaptado para calcular e mostrar prazos de entrega em formato:
  "Receba até 20/09 - Quinta"
*/

/* 
PARA INSTALAR: carregue os scripts abaixo no theme.liquid
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js"></script>
    <script src="{{ 'quickShipping.js' | asset_url }}" defer="defer"></script>
*/

(function () {

  "use strict";

  var debug = true;
  var cartCookie;

  function log(text) {
    if (!debug) return;
    console.log(text);
  }

  /* ID do elemento para adicionar os campos de frete */
  var productSection = document.getElementsByClassName('frete-produto');
  if (!productSection.length) { log('Elemento de frete não encontrado'); return }

  /* Encontrar select de variação do produto */
  var productSelect = document.querySelector('.product-variant-id');
  if (!productSelect) { productSelect = document.getElementsByName('id')[0]; }
  if (!productSelect) { log('Não foi possível encontrar o select principal'); return }

  /* Cria os campos de frete */
  var shippingMessage = document.createElement('p');
  var shippingCountry = document.createElement('select');
  var shippingProvince = document.createElement('select');
  var shippingZip = document.createElement('input');
  var freteLista = document.createElement('div');

  /* Ajustes visuais */
  shippingMessage.classList.add('erros-fretes');
  shippingMessage.setAttribute("style", "display:none");

  freteLista.classList.add('listas-de-fretes');
  freteLista.setAttribute("style", "display:none");

  /* Função para inicializar campos */
  var initFields = function () {

    shippingCountry.id = "pais-simulator";
    var countries = ['Brazil'];
    for (var i = 0; i < countries.length; i++) {
      shippingCountry.add(new Option(countries[i], countries[i], i === 0));
    }
    shippingCountry.name = 'shipping_address[country]';

    shippingProvince.id = "estados-simulator";
    var provinces = ['Acre', 'Alagoas', 'Amapa', 'Amazonas', 'Bahia', 'Ceara', 'Distrito Federal', 'Espirito Santo', 'Goias', 'Maranhao', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Para', 'Paraiba', 'Parana', 'Pernambuco', 'Piaui', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondonia', 'Roraima', 'Santa Catarina', 'Sao Paulo', 'Sergipe', 'Tocantins'];
    for (var i = 0; i < provinces.length; i++) {
      shippingProvince.add(new Option(provinces[i], provinces[i], i === 0));
    }
    shippingProvince.name = 'shipping_address[province]';

    shippingZip.type = 'text';
    shippingZip.name = 'shipping_address[zip]';
    shippingZip.className = 'Form__Input cep-calculo-frete form-control';
    shippingZip.placeholder = 'DIGITE SEU CEP';
    $(shippingZip).mask("00.000-000")

    var shippingCalcWrapper = document.createElement('div');
    shippingCalcWrapper.className = 'shipping-calc-wrapper';

    var formularioFrete = document.createElement('div');
    formularioFrete.className = 'formulario-frete';

    var shippingCalcButton = document.createElement('a');
    shippingCalcButton.innerText = 'Calcular';
    shippingCalcButton.className = 'btn btn-underline button--primary button';
    shippingCalcButton.onclick = function () {

      var cepLimpo = shippingZip.value.replace(/\D/g, '');
      shippingMessage.innerHTML = '';
      shippingMessage.setAttribute("style", "display:none");

      $.getJSON("https://viacep.com.br/ws/" + cepLimpo + "/json/?callback=?", function (dados) {

        if (!("erro" in dados)) {
          switch (dados.uf) {
            case 'AC': dados.uf = 'Acre'; break;
            case 'AL': dados.uf = 'Alagoas'; break;
            case 'AP': dados.uf = 'Amapa'; break;
            case 'AM': dados.uf = 'Amazonas'; break;
            case 'BA': dados.uf = 'Bahia'; break;
            case 'CE': dados.uf = 'Ceara'; break;
            case 'DF': dados.uf = 'Distrito Federal'; break;
            case 'ES': dados.uf = 'Espirito Santo'; break;
            case 'GO': dados.uf = 'Goias'; break;
            case 'MA': dados.uf = 'Maranhao'; break;
            case 'MT': dados.uf = 'Mato Grosso'; break;
            case 'MS': dados.uf = 'Mato Grosso do Sul'; break;
            case 'MG': dados.uf = 'Minas Gerais'; break;
            case 'PA': dados.uf = 'Para'; break;
            case 'PB': dados.uf = 'Paraiba'; break;
            case 'PR': dados.uf = 'Parana'; break;
            case 'PE': dados.uf = 'Pernambuco'; break;
            case 'PI': dados.uf = 'Piaui'; break;
            case 'RJ': dados.uf = 'Rio de Janeiro'; break;
            case 'RN': dados.uf = 'Rio Grande do Norte'; break;
            case 'RS': dados.uf = 'Rio Grande do Sul'; break;
            case 'RO': dados.uf = 'Rondonia'; break;
            case 'RR': dados.uf = 'Roraima'; break;
            case 'SC': dados.uf = 'Santa Catarina'; break;
            case 'SP': dados.uf = 'Sao Paulo'; break;
            case 'SE': dados.uf = 'Sergipe'; break;
            case 'TO': dados.uf = 'Tocantins'; break;
          };

          shippingProvince.value = dados.uf;

          if (!productSelect.value.length) { console.log("Nenhuma variação selecionada"); }
          cartCookie = getCookie('cart');
          var tempCookieValue = "temp-cart-cookie___" + Date.now();
          var fakeCookieValue = "fake-cart-cookie___" + Date.now();

          if (!cartCookie) {
            log('sem cookie, criando');
            updateCartCookie(tempCookieValue);
            cartCookie = getCookie('cart');
          }

          if (cartCookie.length < 32) { log('cookie inválido'); return }

          updateCartCookie(fakeCookieValue);

          if (!productSelect.value.length) {
            getRates(parseInt($(productSelect).find('option').get(1).value));
          } else {
            getRates(parseInt(productSelect.value));
          }
          return false;
        }
      }).fail(function () {
        $('.listas-de-fretes').html("");
        shippingMessage.innerHTML = 'Cep não encontrado, tente novamente.';
        shippingMessage.setAttribute("style", "display:flex");
      });

    };

    formularioFrete.appendChild(shippingCountry);
    formularioFrete.appendChild(shippingProvince);
    formularioFrete.appendChild(shippingZip);
    formularioFrete.appendChild(shippingCalcButton);

    // Ordem corrigida: primeiro formulário, depois mensagens/lista
    shippingCalcWrapper.appendChild(formularioFrete);
    shippingCalcWrapper.appendChild(shippingMessage);
    shippingCalcWrapper.appendChild(freteLista);

    productSection[0].appendChild(shippingCalcWrapper);
  };

  /* Cookies */
  var getCookie = function (name) {
    var value = "; " + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length == 2) return parts.pop().split(";").shift();
  };

  var updateCartCookie = function (a) {
    var date = new Date();
    date.setTime(date.getTime() + (14 * 86400000));
    var expires = '; expires=' + date.toGMTString();
    document.cookie = 'cart=' + a + expires + '; path=/';
  };

  var resetCartCookie = function () {
    updateCartCookie(cartCookie);
  };

  /* Função para formatar data de entrega */
  function formatarDataEntrega(dataStr) {
    try {
      // Formato yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
        var partes = dataStr.split("-");
        var ano = parseInt(partes[0], 10);
        var mes = parseInt(partes[1], 10) - 1;
        var dia = parseInt(partes[2], 10);

        var data = new Date(ano, mes, dia);
        var diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        var diaSemana = diasSemana[data.getDay()];

        var diaFormatado = ("0" + dia).slice(-2);
        var mesFormatado = ("0" + (mes + 1)).slice(-2);

        return "Receba até " + diaFormatado + "/" + mesFormatado + " - " + diaSemana;
      }

      // Caso seja "X dias úteis"
      if (/(\d+)/.test(dataStr)) {
        var dias = parseInt(dataStr.match(/(\d+)/)[0]);
        var hoje = new Date();
        hoje.setDate(hoje.getDate() + dias);

        var diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        var diaSemana = diasSemana[hoje.getDay()];

        var diaFormatado = ("0" + hoje.getDate()).slice(-2);
        var mesFormatado = ("0" + (hoje.getMonth() + 1)).slice(-2);

        return "Receba até " + diaFormatado + "/" + mesFormatado + " - " + diaSemana;
      }

      return dataStr;
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return dataStr;
    }
  }

  /* Buscar valores de frete */
  var getRates = function (variantId) {
    $('.listas-de-fretes').html("");
    $('.listas-de-fretes').show();

    if (typeof variantId === 'undefined') { return }

    var productQuantity = document.getElementById('Quantity');
    var quantity = productQuantity ? parseInt(productQuantity.value) : 1;
    var addData = { 'id': variantId, 'quantity': quantity };

    fetch('/cart/add.js', {
      body: JSON.stringify(addData),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'xmlhttprequest'
      },
      method: 'POST'
    }).then(function (response) {
      return response.json();
    }).then(function (json) {
      $.ajax({
        type: "GET",
        url: '/cart/shipping_rates.json',
        data: {
          'shipping_address[country]': shippingCountry.value,
          'shipping_address[province]': shippingProvince.value,
          'shipping_address[zip]': shippingZip.value
        },
        beforeSend: function () {
          $('.listas-de-fretes').html("<img id='loading-icon-frete' src='https://cdn.shopify.com/s/files/1/0698/5852/5417/files/loading-buffering.webp' width='30px' style='width:30px; height: 30px; margin:0 auto'>");
        },
        success: function (d) {
          if (d.shipping_rates && d.shipping_rates.length) {
            for (var i = 0; i < d.shipping_rates.length; i++) {
              var entrega;

              if (d.shipping_rates[i].delivery_date != null) {
                entrega = formatarDataEntrega(d.shipping_rates[i].delivery_date);
              } else if (d.shipping_rates[i].description != null) {
                entrega = formatarDataEntrega(d.shipping_rates[i].description);
              } else {
                entrega = "Estimativa de entrega indisponível";
              }

              var valorFrete = d.shipping_rates[i].price;
              if (valorFrete == "0.00" || valorFrete == null) {
                valorFrete = "Grátis";
              }

              $('<div class="frete-item"> \
                  <div> \
                      <p class="m-0 nome-frete"> \
                          <b><span class="frete-item-head" style="font-size: 1.4rem; font-weight: 400;">' + d.shipping_rates[i].name + '</span></b> \
                          <span class="estimativa-de-entrega">' + entrega + '</span> \
                      </p> \
                  </div> \
                  <div class="frete-valor" style="font-size: 1.4rem; font-weight: 400;"> \
                      Valor: <b><span class="frete-item-head" style="font-weight: 400;"> R$' + valorFrete + '</span></b> \
                  </div> \
              </div>').appendTo('.listas-de-fretes');
            };

            $('#loading-icon-frete').remove();
          } else {
            $('.listas-de-fretes').html("<p>Opss, não encontramos fretes disponíveis para este cep, tente novamente.</p>");
          }
          resetCartCookie();
          $('#loading-icon-frete').remove();
        },
        error: function () {
          resetCartCookie();
          $('.listas-de-fretes').html("");
          shippingMessage.innerHTML = 'Cep não encontrado, tente novamente.';
          shippingMessage.setAttribute("style", "display:flex");
        },
        dataType: 'json'
      }).fail(function () {
        alert("Falha ao buscar frete");
      })
    }).catch(function (err) {
      console.error(err);
      resetCartCookie()
    });

  };

  initFields();

})();
