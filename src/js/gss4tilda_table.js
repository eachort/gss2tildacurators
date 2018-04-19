//Пример связки таблицы в Тильде (id) и таблицы в GoogleSpreadsheets (url). Строка запроса (req) определяет какие данные нужны.
//Если нужно несколько таблиц, то нужно добавить несколько записей в массив.
//var prms = [];
//prms.push({
//	id : '12345678',
//	url: 'https://docs.google.com/spreadsheets/d/1OXpfdnvu8_vgvIyxKOVHFWGCEmNxTBC9sgqkmA6fWlw/edit?usp=sharing',
//	req: 'select B, D, E, F, G where A="ЖК Пермские высоты"'
//});
var curBlock = 0; //для последовательного заполнения нескольких таблиц.
var google = {visualization: {Query: {setResponse: function(){}}}} //callback функция для получения ответа от google spreadsheets

function gss4tilda_createT526 (blockID, data)
{
	//контейнер данных
	var T526Container = $("#rec"+blockID + " .t526__container:first");
	//первый элемент который будем клонировать
	var T526Element = $("#rec"+blockID + " .t526__container .t-col:first");

	//Заполняем блок команды
	for(var i=0; i<data.table.rows.length; i++)
	{
		if ( data.table.rows[i].c[0] !== null && typeof data.table.rows[i].c[0] === 'object' && data.table.rows[i].c[0].v !== null && data.table.rows[i].c[0].v !== ''
			&& data.table.rows[i].c[1] !== null && typeof data.table.rows[i].c[1] === 'object' && data.table.rows[i].c[1].v !== null && data.table.rows[i].c[1].v !== ''
			&& data.table.rows[i].c[2] !== null && typeof data.table.rows[i].c[2] === 'object' && data.table.rows[i].c[2].v !== null && data.table.rows[i].c[2].v !== ''
			&& data.table.rows[i].c[3] !== null && typeof data.table.rows[i].c[3] === 'object' && data.table.rows[i].c[3].v !== null && data.table.rows[i].c[3].v !== ''
		)
		{
			if (i > 1 && ((i+1) % 3 === 1)) {
				$('<div class="t-clear t526__separator"></div>').appendTo(T526Container);
			}
			//Копируем блок членом команды
			T526CurElement = i==0 ? T526Element : $(T526Element).clone().appendTo(T526Container);
			//Меняем содержимое
			//Картинка
			$(T526CurElement).find(".t526__bgimg:first")
				.attr('data-original', data.table.rows[i].c[0].v)
				.css({'background-image': "url(" + htmlentities(data.table.rows[i].c[0].v) + ")"});
			//Имя
			$(T526CurElement).find(".t526__persname:first").html( htmlentities(data.table.rows[i].c[1].v) );
			//Ник в телеграме
			$(T526CurElement).find(".t526__persdescr:first").html( htmlentities(data.table.rows[i].c[2].v) );
			//Описание
			$(T526CurElement).find(".t526__perstext:first").html( htmlentities(data.table.rows[i].c[3].v) );
		}
	}
}

//Callback функция для полуения данных от google в формате jsonp
google.visualization.Query.setResponse = function(data)
{
	//Получаем ссылку на нужный блок
	var blockID = prms[curBlock].id;
	var blockType = $("#rec"+blockID + " div:first").attr("class");

	switch (blockType) {
		case 't526' :
			//team
			gss4tilda_createT526(blockID, data);
			break;

	}


	//Переходим к следующему блоку или сбрасываем счетчик
	if (curBlock < prms.length-1)
	{
		curBlock++;
		getGssData();
	}
	else
	{
		curBlock = 0;
	}
}

//функция запроса данных от google spreadsheets
function getGssData()
{
	//Проверяем наличие всех необходимых данных
	if ("id" in prms[curBlock] && "url" in prms[curBlock] && "req" in prms[curBlock])
	{
		//Если вместо id таблицы стоит 0, то берем таблицу из предыдущего блока
		if(prms[curBlock].id==='0')
		{
			$("script[src]").each(function(){
				if(~this.src.indexOf("gss4tilda_table.js"))
					prms[curBlock].id = $(this).parents('.r').prev().attr('id').substr(3);
			});
		}
		//TODO: Добавить проверку на наличие rec в начале ID и удаление
		//получаем код таблицы из url и отправляем запрос на получение данных
		var gssCode = prms[curBlock]["url"].slice( prms[curBlock]["url"].indexOf("spreadsheets/d/") + 15, prms[curBlock]["url"].indexOf("/edit?"));
		$.ajax({
			url: 'https://docs.google.com/a/google.com/spreadsheets/d/' + gssCode + '/gviz/tq?tq=' + encodeURIComponent( prms[curBlock].req ),
			dataType : 'jsonp'
		});
	}
}

function htmlentities(s){	// Convert all applicable characters to HTML entities
	//
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

	var div = document.createElement('div');
	var text = document.createTextNode(s);
	div.appendChild(text);
	return div.innerHTML;
}

$().ready(function(){
	//сбрасываем счетчик таблиц и получаем первую таблицу
	curBlock = 0;
	getGssData();
})
