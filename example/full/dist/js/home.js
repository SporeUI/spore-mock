$(function() {
	$('#button').on('click', function() {
		$.ajax({
			url: '/api/list'
		}).done(function(rs) {
			var list = rs.data.list;
			$('#count').html(list.length);
			$('#list').html(list.map(function(item) {
				return [
					'<li>',
					'<span class="name">' + item.name + '</span>',
					'<span class="value">' + item.value + '</span>',
					'</li>'
				].join('');
			}).join(''));
		});
	});
});