extends Area2D

var ship_rotation_speed
var ship_speed

func _ready():
	add_to_group("enemies")
	ship_rotation_speed = randf_range(PI/2, PI)
	ship_speed = randf_range(50, 150)

func _physics_process(delta):
	rotation += ship_rotation_speed * delta
	
	var ship_repulsion_direction = Vector2.ZERO
	var enemies = get_tree().get_nodes_in_group("enemies")
	for e in enemies:
		if overlaps_area(e):
			ship_repulsion_direction += e.position.direction_to(position)
	
	var ship_velocity = Vector2.ZERO
	ship_velocity += position.direction_to(get_tree().get_nodes_in_group("players")[0].position) 
	ship_velocity += ship_repulsion_direction.normalized() * 0.25
	ship_velocity = ship_velocity.normalized() * ship_speed
	position += ship_velocity * delta


func _on_area_entered(area):
	if area.is_in_group("missiles"):
		queue_free()
