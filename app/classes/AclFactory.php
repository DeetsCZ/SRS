<?php
/**
 * Date: 15.11.12
 * Time: 13:25
 * Author: Michal Májský
 */
namespace SRS\Factory;

use SRS\Model\Acl\Resource;
use SRS\Model\Acl\Permission;
use SRS\Model\Acl\Role;

/**
 * Pro vytvareni testovacich a inicializacnich dat modulu ACL
 */
class AclFactory
{
    //protected $roles;

    public static function createRoles()
    {
        $roles = array();
        $roles[] = $guest = new Role(Role::GUEST);
        $roles[] = $registered = new Role(Role::REGISTERED);
        $roles[] = $unapproved = new Role(Role::UNAPPROVED);
        $roles[] = $attendee = new Role(Role::ATTENDEE);
        $roles[] = $serviceTeam = new Role(Role::SERVICE_TEAM);
        $roles[] = $lector = new Role(Role::LECTOR);
        $roles[] = $organizer = new Role(Role::ORGANIZER);
        $roles[] = $admin = new Role(Role::ADMIN);

        $admin->registerable = false;
        $registered->registerable = false;
        $unapproved->registerable = false;
        $guest->registerable = false;
        $attendee->approvedAfterRegistration = true;

        $guest->syncedWithSkautIS = false;
        $registered->syncedWithSkautIS = false;
        $unapproved->syncedWithSkautIS = false;

        $backend = new Resource(Resource::BACKEND);
        $acl = new Resource(Resource::ACL);
        $cms = new Resource(Resource::CMS);
        $program = new Resource(Resource::PROGRAM);
        $configuration = new Resource(Resource::CONFIGURATION);
        $evidence = new Resource(Resource::EVIDENCE);
        $mailing = new Resource(Resource::MAILING);
        $room = new Resource(Resource::ROOM);
        $category = new Resource(Resource::CATEGORY);

        $admin_access = new Permission(Permission::ACCESS, $backend);
        $admin->permissions->add($admin_access);
        $organizer->permissions->add($admin_access);
        $lector->permissions->add($admin_access);
        $serviceTeam->permissions->add($admin_access);

        $acl_edit = new Permission(Permission::MANAGE, $acl);
        $admin->permissions->add($acl_edit);
        $organizer->permissions->add($acl_edit);

        $cms_edit = new Permission(Permission::MANAGE, $cms);
        $admin->permissions->add($cms_edit);
        $organizer->permissions->add($cms_edit);

        $configuration_edit = new Permission(Permission::MANAGE, $configuration);
        $admin->permissions->add($configuration_edit);
        $organizer->permissions->add($configuration_edit);

        $program_allow = new Permission(Permission::ACCESS, $program);
        $admin->permissions->add($program_allow);
        $organizer->permissions->add($program_allow);
        $lector->permissions->add($program_allow);
        $serviceTeam->permissions->add($program_allow);

        $program_edit_mine = new Permission(Permission::MANAGE_OWN_PROGRAMS, $program);
        $lector->permissions->add($program_edit_mine);

        $program_edit = new Permission(Permission::MANAGE_ALL_PROGRAMS, $program);
        $admin->permissions->add($program_edit);
        $organizer->permissions->add($program_edit);

        $program_harmonogram_edit = new Permission(Permission::MANAGE_HARMONOGRAM, $program);
        $admin->permissions->add($program_harmonogram_edit);
        $organizer->permissions->add($program_harmonogram_edit);

        $program_choose = new Permission(Permission::CHOOSE_PROGRAMS, $program);
        $attendee->permissions->add($program_choose);

        $evidence_edit = new Permission(Permission::MANAGE, $evidence);
        $admin->permissions->add($evidence_edit);
        $organizer->permissions->add($evidence_edit);

        $mailing_edit = new Permission(Permission::MANAGE, $mailing);
        $admin->permissions->add($mailing_edit);
        $organizer->permissions->add($mailing_edit);

        $room_edit = new Permission(Permission::MANAGE, $room);
        $admin->permissions->add($room_edit);
        $organizer->permissions->add($room_edit);

        $category_edit = new Permission(Permission::MANAGE, $category);
        $admin->permissions->add($category_edit);
        $organizer->permissions->add($category_edit);

        return $roles;
    }


}
